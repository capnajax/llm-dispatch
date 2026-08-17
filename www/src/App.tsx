import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Archive,
  Check,
  ChevronLeft,
  ChevronRight,
  Menu,
  MessageSquare,
  Moon,
  PanelLeft,
  Plus,
  Search,
  Sun,
} from "lucide-react";
import {
  appendMessage,
  createConversationWithMessage,
  deleteConversation,
  getConversation,
  getStubIdentity,
  listConversationMessages,
  listLiveConversations,
  openDatabase,
  removeEmptyAssistant,
  renameConversation,
  updateMessage,
  type Conversation,
  type Message,
  type StubIdentity,
} from "../schema";
import { Composer } from "./components/Composer";
import { ConversationRow } from "./components/ConversationRow";
import { DeleteDialog } from "./components/DeleteDialog";
import { Empty } from "./components/Empty";
import { ErrorPage } from "./components/ErrorPage";
import { IconButton } from "./components/IconButton";
import { Loading } from "./components/Loading";
import { MessageList } from "./components/MessageList";
import { RenameDialog } from "./components/RenameDialog";
import {
  Status,
  type InferenceState,
} from "./components/Status";
import { ThemeControl, type Theme } from "./components/ThemeControl";
import { apiContext, deriveTitle, visibleMessages } from "./domain";
import { streamCompletion } from "./chat";

type ConversationGroup = [string, Conversation[]];
const uuid = () => crypto.randomUUID();
const now = () => new Date().toISOString();
const conversationPath = (id?: string) => (id ? `/c/${id}` : "/");

function groupConversations(values: Conversation[]): ConversationGroup[] {
  const groups: Record<string, Conversation[]> = {
    Today: [],
    "Previous 7 days": [],
    Older: [],
  };
  for (const value of values) {
    const days = (Date.now() - Date.parse(value.updatedAt)) / 86400000;
    groups[days < 1 ? "Today" : days < 7 ? "Previous 7 days" : "Older"].push(
      value,
    );
  }
  return Object.entries(groups).filter(([, items]) => items.length);
}

export default function App() {
  const [database, setDatabase] = useState<IDBDatabase>();
  const [identity, setIdentity] = useState<StubIdentity>();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [startupError, setStartupError] = useState<Error>();
  const [notFound, setNotFound] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [inference, setInference] = useState<InferenceState>("connecting");
  const [generationId, setGenerationId] = useState<string>();
  const [toast, setToast] = useState("");
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem("llm-dispatch-theme") as Theme) || "system",
  );
  const [deleteTarget, setDeleteTarget] = useState<Conversation>();
  const [renameTarget, setRenameTarget] = useState<Conversation>();
  const searchRef = useRef<HTMLInputElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const aborters = useRef(new Map<string, AbortController>());
  const nearBottom = useRef(true);

  const refresh = useCallback(
    async (db = database, org = identity?.organization.id) => {
      if (!db || !org) return;
      setConversations(await listLiveConversations(db, org));
    },
    [database, identity],
  );

  const select = useCallback(
    async (id?: string, replace = false) => {
      setActiveId(id);
      setDrawer(false);
      setNotFound(false);
      history[replace ? "replaceState" : "pushState"](
        {},
        "",
        conversationPath(id),
      );
      if (database && id) {
        const conversation = await getConversation(database, id);
        if (!conversation) {
          setNotFound(true);
          setMessages([]);
          return;
        }
        setMessages(await listConversationMessages(database, id));
      } else setMessages([]);
    },
    [database],
  );

  const initialize = useCallback(async () => {
    setLoading(true);
    setStartupError(undefined);
    try {
      const db = await openDatabase();
      const id = await getStubIdentity(db);
      const list = await listLiveConversations(db, id.organization.id);
      setDatabase(db);
      setIdentity(id);
      setConversations(list);
      const match = location.pathname.match(/^\/c\/([^/]+)$/);
      if (match) {
        const candidate = decodeURIComponent(match[1]);
        const found = await getConversation(db, candidate);
        if (found) {
          setActiveId(candidate);
          setMessages(await listConversationMessages(db, candidate));
        } else {
          setActiveId(candidate);
          setNotFound(true);
        }
      } else if (location.pathname === "/" && list[0]) {
        setActiveId(list[0].id);
        setMessages(await listConversationMessages(db, list[0].id));
        history.replaceState({}, "", conversationPath(list[0].id));
      }
    } catch (error) {
      setStartupError(error as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void initialize();
    return () => database?.close();
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("llm-dispatch-theme", theme);
  }, [theme]);
  useEffect(() => {
    fetch("/v1/probe")
      .then((response) => {
        if (!response.ok) throw new Error();
        setInference("ready");
      })
      .catch(() => setInference("offline"));
  }, []);
  useEffect(() => {
    const onPop = () => {
      const id = location.pathname.match(/^\/c\/([^/]+)$/)?.[1];
      void select(id ? decodeURIComponent(id) : undefined, true);
    };
    const onKey = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return;
      if (event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCollapsed(false);
        setDrawer(true);
        setTimeout(() => searchRef.current?.focus(), 0);
      }
      if (event.key.toLowerCase() === "b") {
        event.preventDefault();
        setCollapsed((value) => !value);
        setDrawer(false);
      }
      if (event.shiftKey && event.key.toLowerCase() === "o") {
        event.preventDefault();
        void select();
        setTimeout(() => composerRef.current?.focus(), 0);
      }
    };
    addEventListener("popstate", onPop);
    addEventListener("keydown", onKey);
    return () => {
      removeEventListener("popstate", onPop);
      removeEventListener("keydown", onKey);
    };
  }, [select]);
  useEffect(() => {
    if (toast) {
      const id = setTimeout(() => setToast(""), 1800);
      return () => clearTimeout(id);
    }
  }, [toast]);
  useEffect(() => {
    if (nearBottom.current)
      transcriptRef.current?.scrollTo({
        top: transcriptRef.current.scrollHeight,
        behavior: generationId ? "auto" : "smooth",
      });
  }, [messages, generationId]);

  const active = conversations.find(
    (conversation) => conversation.id === activeId,
  );
  const filtered = conversations.filter((conversation) =>
    conversation.title.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
  );

  async function saveAssistant(
    conversation: Conversation,
    assistant: Message,
    content: string,
    status: Message["status"],
  ) {
    if (!database) return;
    const updatedAt = now();
    const freshConversation =
      (await getConversation(database, conversation.id)) ?? conversation;
    const updated = {
      ...assistant,
      content,
      status,
      updatedAt,
      revision: assistant.revision + 1,
    };
    await updateMessage(database, updated, {
      ...freshConversation,
      updatedAt,
      revision: freshConversation.revision + 1,
    });
    setMessages((values) =>
      values.map((value) => (value.id === assistant.id ? updated : value)),
    );
    await refresh();
  }

  async function generate(
    conversation: Conversation,
    assistant: Message,
    context: Message[],
  ) {
    if (!database) return;
    const controller = new AbortController();
    aborters.current.set(conversation.id, controller);
    setGenerationId(conversation.id);
    setInference("ready");
    let streamed = "";
    try {
      const result = await streamCompletion(
        apiContext(context),
        controller.signal,
        (content) => {
          streamed = content;
          setMessages((values) =>
            values.map((value) =>
              value.id === assistant.id ? { ...value, content } : value,
            ),
          );
        },
      );
      await saveAssistant(conversation, assistant, result.content, "complete");
    } catch (error) {
      const stopped = controller.signal.aborted;
      if (streamed)
        await saveAssistant(
          conversation,
          assistant,
          streamed,
          stopped ? "cancelled" : "error",
        );
      else {
        await removeEmptyAssistant(database, assistant.id);
        setMessages((values) =>
          values.filter((value) => value.id !== assistant.id),
        );
      }
      if (!stopped) setInference("offline");
    } finally {
      aborters.current.delete(conversation.id);
      setGenerationId(undefined);
    }
  }

  async function sendMessage() {
    const text = draft.trim();
    if (!text || !database || !identity || generationId) return;
    setDraft("");
    const createdAt = now();
    let conversation = active;
    let before = messages;
    const userId = uuid();
    const tail = visibleMessages(before).at(-1);
    const user: Message = {
      id: userId,
      organizationId: identity.organization.id,
      conversationId: conversation?.id ?? "",
      parentMessageId: tail?.id ?? null,
      rootMessageId: tail?.rootMessageId ?? userId,
      role: "user",
      authorUserId: identity.user.id,
      content: text,
      status: "complete",
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
      revision: 1,
    };
    try {
      if (!conversation) {
        conversation = {
          id: uuid(),
          organizationId: identity.organization.id,
          createdByUserId: identity.user.id,
          title: deriveTitle(text),
          titleSource: "generated",
          createdAt,
          updatedAt: createdAt,
          deletedAt: null,
          revision: 1,
        };
        user.conversationId = conversation.id;
        await createConversationWithMessage(database, {
          conversation,
          message: user,
        });
        setActiveId(conversation.id);
        history.pushState({}, "", conversationPath(conversation.id));
        before = [];
      } else {
        await appendMessage(database, user, conversation.id);
      }
      const assistantTime = now();
      const assistant: Message = {
        id: uuid(),
        organizationId: conversation.organizationId,
        conversationId: conversation.id,
        parentMessageId: user.id,
        rootMessageId: user.rootMessageId,
        role: "assistant",
        authorUserId: null,
        content: "",
        status: "pending",
        createdAt: assistantTime,
        updatedAt: assistantTime,
        deletedAt: null,
        revision: 1,
      };
      await appendMessage(database, assistant, conversation.id);
      const context = [...before, user, assistant];
      setMessages(context);
      await refresh(database, identity.organization.id);
      await generate(conversation, assistant, context);
    } catch (error) {
      setDraft(text);
      setToast(
        error instanceof Error ? error.message : "Could not save message",
      );
    }
  }

  async function retry(message?: Message) {
    if (!database || !active || generationId) return;
    const target = message?.role === "assistant" ? message : undefined;
    let assistant = target;
    if (assistant) {
      const updatedAt = now();
      assistant = {
        ...assistant,
        content: "",
        status: "pending",
        updatedAt,
        revision: assistant.revision + 1,
      };
      const fresh = (await getConversation(database, active.id)) ?? active;
      await updateMessage(database, assistant, {
        ...fresh,
        updatedAt,
        revision: fresh.revision + 1,
      });
      setMessages((values) =>
        values.map((value) =>
          value.id === assistant!.id ? assistant! : value,
        ),
      );
    } else {
      const tail = visibleMessages(messages).at(-1);
      if (!tail) return;
      const createdAt = now();
      assistant = {
        id: uuid(),
        organizationId: active.organizationId,
        conversationId: active.id,
        parentMessageId: tail.id,
        rootMessageId: tail.rootMessageId,
        role: "assistant",
        authorUserId: null,
        content: "",
        status: "pending",
        createdAt,
        updatedAt: createdAt,
        deletedAt: null,
        revision: 1,
      };
      await appendMessage(database, assistant, active.id);
      setMessages((values) => [...values, assistant!]);
    }
    await generate(
      active,
      assistant,
      messages
        .map((value) => (value.id === assistant!.id ? assistant! : value))
        .concat(
          messages.some((value) => value.id === assistant!.id)
            ? []
            : [assistant],
        ),
    );
  }

  function stop() {
    if (generationId) aborters.current.get(generationId)?.abort();
  }
  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
    setToast("Copied");
  }
  async function confirmRename(title: string) {
    if (!database || !renameTarget) return;
    await renameConversation(database, renameTarget.id, title);
    setRenameTarget(undefined);
    await refresh();
    setToast("Conversation renamed");
  }
  async function confirmDelete() {
    if (!database || !deleteTarget) return;
    const wasActive = deleteTarget.id === activeId;
    await deleteConversation(database, deleteTarget.id);
    setDeleteTarget(undefined);
    const list = await listLiveConversations(
      database,
      identity!.organization.id,
    );
    setConversations(list);
    if (wasActive) await select(list[0]?.id);
  }

  const shellClasses = [
    "app-shell",
    collapsed && "is-collapsed",
    drawer && "drawer-open",
  ]
    .filter(Boolean)
    .join(" ");

  if (startupError)
    return <ErrorPage error={startupError} retry={initialize} />;
  return (
    <div className={shellClasses}>
      {drawer && (
        <button
          className="scrim"
          aria-label="Close conversation drawer"
          onClick={() => setDrawer(false)}
        />
      )}
      <aside className="sidebar" aria-label="Conversations">
        <div className="brand-row">
          <div className="brand-mark">ld</div>
          <strong className="brand-name">llm-dispatch</strong>
          <IconButton
            label="Collapse sidebar"
            icon={<ChevronLeft />}
            onClick={() => setCollapsed(true)}
          />
        </div>
        <button
          className="new-button"
          onClick={() => {
            void select();
            setTimeout(() => composerRef.current?.focus(), 0);
          }}
        >
          <Plus />
          <span>New conversation</span>
        </button>
        <label className="search-box">
          <Search />
          <span className="sr-only">Search conversations</span>
          <input
            ref={searchRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations"
          />
        </label>
        <nav className="conversation-list">
          {groupConversations(filtered).map(([label, values]) => (
            <section key={label}>
              <h2>{label}</h2>
              {values.map((conversation) => (
                <ConversationRow
                  key={conversation.id}
                  conversation={conversation}
                  active={conversation.id === activeId}
                  select={() => void select(conversation.id)}
                  rename={() => setRenameTarget(conversation)}
                  remove={() => setDeleteTarget(conversation)}
                />
              ))}
            </section>
          ))}
          {!loading && !filtered.length && (
            <p className="muted empty-list">
              {search ? "No matching conversations" : "No conversations yet"}
            </p>
          )}
        </nav>
        <div className="sidebar-footer">
          <ThemeControl value={theme} setValue={setTheme} />
          <span>
            <Archive /> Stored on this browser
          </span>
        </div>
        <div className="rail">
          <IconButton
            label="Expand sidebar"
            icon={<ChevronRight />}
            onClick={() => setCollapsed(false)}
          />
          <IconButton
            label="New conversation"
            icon={<Plus />}
            onClick={() => void select()}
          />
          <IconButton
            label="Search conversations"
            icon={<Search />}
            onClick={() => {
              setCollapsed(false);
              setTimeout(() => searchRef.current?.focus(), 0);
            }}
          />
          <IconButton
            label="Change theme"
            icon={theme === "dark" ? <Moon /> : <Sun />}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          />
        </div>
      </aside>
      <main className="main">
        <header className="chat-header">
          <IconButton
            className="menu-button"
            label="Open conversations"
            icon={<Menu />}
            onClick={() => setDrawer(true)}
          />
          <IconButton
            className="desktop-expand"
            label="Expand sidebar"
            icon={<PanelLeft />}
            onClick={() => setCollapsed(false)}
          />
          <button
            className="header-title"
            disabled={!active}
            onClick={() => active && setRenameTarget(active)}
          >
            {active?.title ??
              (notFound ? "Conversation not found" : "New conversation")}
          </button>
          <Status state={inference} />
        </header>
        <div
          ref={transcriptRef}
          className="transcript"
          aria-label="Conversation messages"
          onScroll={(event) => {
            const node = event.currentTarget;
            nearBottom.current =
              node.scrollHeight - node.scrollTop - node.clientHeight < 100;
          }}
        >
          {loading ? (
            <Loading />
          ) : notFound ? (
            <Empty
              icon={<Search />}
              title="Conversation not found"
              text={
                "This conversation may have been deleted or opened " +
                "on another browser."
              }
              action={() => void select()}
            />
          ) : messages.length ? (
            <MessageList
              messages={visibleMessages(messages)}
              generating={generationId === activeId}
              copy={copy}
              retry={retry}
              stop={stop}
            />
          ) : (
            <Empty
              icon={<MessageSquare />}
              title="What can I help with?"
              text="Your conversations are stored privately in this browser."
            />
          )}
        </div>
        {!nearBottom.current && (
          <button
            className="jump"
            onClick={() =>
              transcriptRef.current?.scrollTo({
                top: transcriptRef.current.scrollHeight,
                behavior: "smooth",
              })
            }
          >
            Jump to latest
          </button>
        )}
        {!notFound && (
          <Composer
            ref={composerRef}
            value={draft}
            setValue={setDraft}
            send={sendMessage}
            stop={stop}
            generating={generationId === activeId}
            disabled={!database}
          />
        )}
      </main>
      {renameTarget && (
        <RenameDialog
          conversation={renameTarget}
          close={() => setRenameTarget(undefined)}
          save={confirmRename}
        />
      )}
      {deleteTarget && (
        <DeleteDialog
          conversation={deleteTarget}
          close={() => setDeleteTarget(undefined)}
          remove={confirmDelete}
        />
      )}
      <div className="toast" aria-live="polite">
        {toast && (
          <span>
            <Check />
            {toast}
          </span>
        )}
      </div>
    </div>
  );
}
