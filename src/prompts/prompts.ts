import { promises as fs } from 'node:fs';
import path from 'node:path';
import yaml from 'yaml';
import {
  CreateChatCompletionRequest
} from '../types/generated/openai-types.js';
import { getLogger } from '../lib/logger.js';
import { extend } from '../lib/tools.js';
import {
  OpenAIRoleType,
  PromptConfig,
  PromptConfigPrompt
} from '../types/validators/prompts.js';
import { isOpenAIRoleType } from '../types/generated/prompts-clamps.js';

const MODULE = 'prompts';

const DEFAULT_REQUEST_PARAMS:Partial<CreateChatCompletionRequest> = {
  max_tokens: 100,
  temperature: 0.5
};

let promptConfigData: undefined|PromptConfig = undefined;
let __promptConfigLoading: null|Promise<void> = null;

export async function loadPromptsConfig(): Promise<void> {
  const log = getLogger(MODULE,
  loadPromptsConfig);
  async function doLoad(): Promise<void> {
    const configBuf = await fs.readFile(
      path.join(path.dirname(process.argv[1]),
  'prompts',
  'prompts.yaml')
    );
    const configRaw = yaml.parse(configBuf.toString());
    const result:PromptConfig = {
      // defaults: Partial<CreateChatCompletionRequest>
      defaults: [DEFAULT_REQUEST_PARAMS],
      grammar: {},
      prompts: {},
    }

    if (configRaw.defaults) {
      result.defaults.push(configRaw.defaults);
    }
    if (configRaw.grammar) {
      for (const gk of Object.keys(configRaw.grammar)) {
        const gv = configRaw.grammar[gk];
        if (typeof gv === 'string') {
          result.grammar[gk] = gv;
        } else {
          log.error('Grammar for "${gk}" must be a string.');
        }
      }
    }
    if (configRaw.prompts) {
      for (const pk of Object.keys(configRaw.prompts)) {
        const pv = configRaw.prompts[pk];
        const resultValue:Partial<PromptConfigPrompt> = {};
        if (pv.grammar) {
          if (typeof pv.grammar === 'object' &&
            Object.hasOwn(pv.grammar,
  'ref')
          ) {
            if (!(resultValue.grammar = result.grammar[pv.grammar.ref])) {
              log.error(`Unsatisfied grammar reference "${pv.grammar.ref}" ` +
                `in prompt "${pk}"`);
            }
          } else if (typeof pv.grammar === 'string') {
            resultValue.grammar = pv.grammar;
          } else {
            log.error(`Invalid grammar data in prompt "${pk}"`);
          }
        }
        if (pv.message) {
          // expect role and content
          if (typeof pv.message === 'object') {
            let role:OpenAIRoleType = 'system';
            if (typeof pv.message.role === 'string' &&
              isOpenAIRoleType(pv.message.role)) {
                role = 'system';
            } else {
              log.error(`Invalid message role in prompt "${pk}"`);
            }
            if (typeof pv.message.content === 'string') {
              resultValue.message = { role,
  content: pv.message.content };
            } else {
              log.error(`Invalid or missing message content in prompt "${pk}"`);
            }
          } else if (typeof pv.message === 'string') {
            resultValue.message = {
              role: 'system',
  
              content: pv.message
            };
          }
          resultValue.parameters = extend({},
  ...result.defaults);
          if (pv.parameters) {
            extend(resultValue.parameters,
  pv.parameters);
          }
        } else {
          log.error(`Message required in prompt "${pk}"`)
          resultValue.message = {role: 'system',
  content: 'error'}
        }
        result.prompts[pk] = resultValue as PromptConfigPrompt;
      }
    }
    promptConfigData = result;
  }
  if (__promptConfigLoading === null) {
    __promptConfigLoading = doLoad();
  }
  return __promptConfigLoading;
}

export async function getPromptConfigData():Promise<PromptConfig> {
  if (__promptConfigLoading) {
    return __promptConfigLoading.then(() => {
      return promptConfigData as PromptConfig;
    })
  } else {
    await loadPromptsConfig();
    return promptConfigData as PromptConfig;
  }
}
