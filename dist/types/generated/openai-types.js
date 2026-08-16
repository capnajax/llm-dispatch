/**
 * @module openai-types
 * Schemas from the OpenAI swaggar translated into types, interfaces, and
 * typeguards for TypeScript. Only the types requested for export are
 * actually exported, and only the same plus all their dependencies are
 * generated.
 */
export function isChatCompletionRequestMessage(o) {
    return (isChatCompletionRequestDeveloperMessage(o) ||
        isChatCompletionRequestSystemMessage(o) ||
        isChatCompletionRequestUserMessage(o) ||
        isChatCompletionRequestAssistantMessage(o) ||
        isChatCompletionRequestToolMessage(o) ||
        isChatCompletionRequestFunctionMessage(o));
}
export function isChatCompletionStreamResponseDelta(o) {
    return (typeof o === 'object' &&
        o !== null &&
        !!(o ??
            (typeof o.content === 'string' ||
                o.content === null ||
                o.content === undefined)) &&
        typeof o.function_call === 'object' &&
        o.function_call !== null &&
        typeof o.function_call.arguments === 'string' &&
        typeof o.function_call.name === 'string' &&
        Array.isArray(o.tool_calls) &&
        o.tool_calls.every((tool_callsItem) => isChatCompletionMessageToolCallChunk(tool_callsItem)) &&
        ['developer', 'system', 'user', 'assistant', 'tool'].includes(o.role) &&
        !!(o ??
            (typeof o.refusal === 'string' ||
                o.refusal === null ||
                o.refusal === undefined)));
}
export function isCreateChatCompletionRequest(o) {
    return (typeof o === 'object' &&
        typeof o === 'object' &&
        typeof o === 'object' &&
        o !== null &&
        isMetadata(o.metadata) &&
        !!(o ??
            ((typeof o.top_logprobs === 'number' &&
                o.top_logprobs <= 20 &&
                Number.isInteger(o.top_logprobs)) ||
                o.top_logprobs === null ||
                o.top_logprobs === undefined)) &&
        !!(o ??
            ((typeof o.temperature === 'number' && o.temperature <= 2) ||
                o.temperature === null ||
                o.temperature === undefined)) &&
        !!(o ??
            ((typeof o.top_p === 'number' && o.top_p <= 1) ||
                o.top_p === null ||
                o.top_p === undefined)) &&
        typeof o.user === 'string' &&
        typeof o.safety_identifier === 'string' &&
        typeof o.prompt_cache_key === 'string' &&
        isServiceTier(o.service_tier) &&
        !!(o ??
            (['in_memory', '24h'].includes(o.prompt_cache_retention) ||
                o.prompt_cache_retention === null ||
                o.prompt_cache_retention === undefined)) &&
        o !== null &&
        typeof o.top_logprobs === 'number' &&
        o.top_logprobs <= 20 &&
        Number.isInteger(o.top_logprobs) &&
        o !== null &&
        Array.isArray(o.messages) &&
        o.messages.every((messagesItem) => isChatCompletionRequestMessage(messagesItem)) &&
        isModelIdsShared(o.model) &&
        isResponseModalities(o.modalities) &&
        isVerbosity(o.verbosity) &&
        isReasoningEffort(o.reasoning_effort) &&
        (o.max_completion_tokens === null ||
            (typeof o.max_completion_tokens === 'number' &&
                Number.isInteger(o.max_completion_tokens))) &&
        (o.frequency_penalty === null ||
            (typeof o.frequency_penalty === 'number' &&
                o.frequency_penalty >= -2 &&
                o.frequency_penalty <= 2)) &&
        (o.presence_penalty === null ||
            (typeof o.presence_penalty === 'number' &&
                o.presence_penalty >= -2 &&
                o.presence_penalty <= 2)) &&
        typeof o.web_search_options === 'object' &&
        o.web_search_options !== null &&
        (o.web_search_options.user_location === null ||
            typeof o.web_search_options.user_location === 'object') &&
        isWebSearchContextSize(o.web_search_options.search_context_size) &&
        (o.top_logprobs === null ||
            (typeof o.top_logprobs === 'number' &&
                o.top_logprobs <= 20 &&
                Number.isInteger(o.top_logprobs))) &&
        !!(o ??
            (isResponseFormatText(o.response_format) ||
                isResponseFormatJsonSchema(o.response_format) ||
                isResponseFormatJsonObject(o.response_format))) &&
        (o.store === null || typeof o.store === 'boolean') &&
        (o.stream === null || typeof o.stream === 'boolean') &&
        isStopConfiguration(o.stop) &&
        (o.logit_bias === null || typeof o.logit_bias === 'object') &&
        (o.logprobs === null || typeof o.logprobs === 'boolean') &&
        (o.max_tokens === null ||
            (typeof o.max_tokens === 'number' && Number.isInteger(o.max_tokens))) &&
        (o.n === null ||
            (typeof o.n === 'number' &&
                o.n >= 1 &&
                o.n <= 128 &&
                Number.isInteger(o.n))) &&
        !!(o ?? (o.prediction === null || isPredictionContent(o.prediction))) &&
        (o.seed === null ||
            (typeof o.seed === 'number' &&
                o.seed >= -9223372036854776000 &&
                o.seed <= 9223372036854776000 &&
                Number.isInteger(o.seed))) &&
        isChatCompletionStreamOptions(o.stream_options) &&
        Array.isArray(o.tools) &&
        o.tools.every((toolsItem) => {
            return (isChatCompletionTool(toolsItem) ||
                isCustomToolChatCompletions(toolsItem));
        }) &&
        isChatCompletionToolChoiceOption(o.tool_choice) &&
        isParallelToolCalls(o.parallel_tool_calls) &&
        !!(o ??
            (['none', 'auto'].includes(o.function_call) ||
                isChatCompletionFunctionCallOption(o.function_call))) &&
        Array.isArray(o.functions) &&
        o.functions.every((functionsItem) => isChatCompletionFunctions(functionsItem)));
}
export function isCreateChatCompletionResponse(o) {
    return (typeof o === 'object' &&
        o !== null &&
        typeof o.id === 'string' &&
        Array.isArray(o.choices) &&
        o.choices.every((choicesItem) => {
            return ((typeof choicesItem === 'object' &&
                choicesItem !== null &&
                [
                    'stop',
                    'length',
                    'tool_calls',
                    'content_filter',
                    'function_call',
                ].includes(choicesItem.finish_reason) &&
                typeof choicesItem.index === 'number' &&
                Number.isInteger(choicesItem.index) &&
                isChatCompletionResponseMessage(choicesItem.message) &&
                ((typeof choicesItem.logprobs === 'object' &&
                    choicesItem.logprobs !== null &&
                    Array.isArray(choicesItem.logprobs.content) &&
                    choicesItem.logprobs.content.every((contentItem) => isChatCompletionTokenLogprob(contentItem))) ||
                    ((choicesItem.logprobs.content === null ||
                        choicesItem.logprobs.content === undefined) &&
                        Array.isArray(choicesItem.logprobs.refusal) &&
                        choicesItem.logprobs.refusal.every((refusalItem) => isChatCompletionTokenLogprob(refusalItem))) ||
                    choicesItem.logprobs.refusal === null ||
                    choicesItem.logprobs.refusal === undefined)) ||
                choicesItem.logprobs === null ||
                choicesItem.logprobs === undefined);
        }) &&
        typeof o.created === 'number' &&
        Number.isInteger(o.created) &&
        typeof o.model === 'string' &&
        isServiceTier(o.service_tier) &&
        typeof o.system_fingerprint === 'string' &&
        ['chat.completion'].includes(o.object) &&
        isCompletionUsage(o.usage));
}
export function isCreateChatCompletionStreamResponse(o) {
    return (typeof o === 'object' &&
        o !== null &&
        typeof o.id === 'string' &&
        Array.isArray(o.choices) &&
        o.choices.every((choicesItem) => {
            return (typeof choicesItem === 'object' &&
                choicesItem !== null &&
                isChatCompletionStreamResponseDelta(choicesItem.delta) &&
                (choicesItem.logprobs === null ||
                    typeof choicesItem.logprobs === 'object') &&
                (choicesItem.finish_reason === null ||
                    [
                        'stop',
                        'length',
                        'tool_calls',
                        'content_filter',
                        'function_call',
                    ].includes(choicesItem.finish_reason)) &&
                typeof choicesItem.index === 'number' &&
                Number.isInteger(choicesItem.index));
        }) &&
        typeof o.created === 'number' &&
        Number.isInteger(o.created) &&
        typeof o.model === 'string' &&
        isServiceTier(o.service_tier) &&
        typeof o.system_fingerprint === 'string' &&
        ['chat.completion.chunk'].includes(o.object) &&
        isCompletionUsage(o.usage));
}
export function isReasoningEffort(o) {
    return (['none', 'minimal', 'low', 'medium', 'high', 'xhigh'].includes(o) ||
        o === null ||
        o === undefined);
}
export function isResponseFormatJsonObject(o) {
    return (typeof o === 'object' && o !== null && ['json_object'].includes(o.type));
}
export function isResponseFormatJsonSchema(o) {
    return (typeof o === 'object' &&
        o !== null &&
        ['json_schema'].includes(o.type) &&
        typeof o.json_schema === 'object' &&
        o.json_schema !== null &&
        typeof o.json_schema.description === 'string' &&
        typeof o.json_schema.name === 'string' &&
        isResponseFormatJsonSchemaSchema(o.json_schema.schema) &&
        !!(o.json_schema ??
            (typeof o.json_schema.strict === 'boolean' ||
                o.json_schema.strict === null ||
                o.json_schema.strict === undefined)));
}
export function isResponseFormatText(o) {
    return typeof o === 'object' && o !== null && ['text'].includes(o.type);
}
function isChatCompletionAllowedTools(o) {
    return (typeof o === 'object' &&
        o !== null &&
        ['auto', 'required'].includes(o.mode) &&
        Array.isArray(o.tools) &&
        o.tools.every((toolsItem) => {
            return typeof toolsItem === 'object' && toolsItem !== null;
        }));
}
function isChatCompletionAllowedToolsChoice(o) {
    return (typeof o === 'object' &&
        o !== null &&
        ['allowed_tools'].includes(o.type) &&
        isChatCompletionAllowedTools(o.allowed_tools));
}
function isChatCompletionFunctionCallOption(o) {
    return typeof o === 'object' && o !== null && typeof o.name === 'string';
}
function isChatCompletionFunctions(o) {
    return (typeof o === 'object' &&
        o !== null &&
        typeof o.description === 'string' &&
        typeof o.name === 'string' &&
        isFunctionParameters(o.parameters));
}
function isChatCompletionMessageCustomToolCall(o) {
    return (typeof o === 'object' &&
        o !== null &&
        typeof o.id === 'string' &&
        ['custom'].includes(o.type) &&
        typeof o.custom === 'object' &&
        o.custom !== null &&
        typeof o.custom.name === 'string' &&
        typeof o.custom.input === 'string');
}
function isChatCompletionMessageToolCall(o) {
    return (typeof o === 'object' &&
        o !== null &&
        typeof o.id === 'string' &&
        ['function'].includes(o.type) &&
        typeof o.function === 'object' &&
        o.function !== null &&
        typeof o.function.name === 'string' &&
        typeof o.function.arguments === 'string');
}
function isChatCompletionMessageToolCallChunk(o) {
    return (typeof o === 'object' &&
        o !== null &&
        typeof o.index === 'number' &&
        Number.isInteger(o.index) &&
        typeof o.id === 'string' &&
        ['function'].includes(o.type) &&
        typeof o.function === 'object' &&
        o.function !== null &&
        typeof o.function.name === 'string' &&
        typeof o.function.arguments === 'string');
}
function isChatCompletionMessageToolCalls(o) {
    return (Array.isArray(o) &&
        o.every((oItem) => {
            return (isChatCompletionMessageToolCall(oItem) ||
                isChatCompletionMessageCustomToolCall(oItem));
        }));
}
function isChatCompletionNamedToolChoice(o) {
    return (typeof o === 'object' &&
        o !== null &&
        ['function'].includes(o.type) &&
        typeof o.function === 'object' &&
        o.function !== null &&
        typeof o.function.name === 'string');
}
function isChatCompletionNamedToolChoiceCustom(o) {
    return (typeof o === 'object' &&
        o !== null &&
        ['custom'].includes(o.type) &&
        typeof o.custom === 'object' &&
        o.custom !== null &&
        typeof o.custom.name === 'string');
}
function isChatCompletionRequestAssistantMessage(o) {
    return (typeof o === 'object' &&
        o !== null &&
        !!(o ??
            (typeof o.content === 'string' ||
                (Array.isArray(o.content) &&
                    o.content.every((contentItem) => isChatCompletionRequestAssistantMessageContentPart(contentItem))) ||
                o.content === null ||
                o.content === undefined)) &&
        !!(o ??
            (typeof o.refusal === 'string' ||
                o.refusal === null ||
                o.refusal === undefined)) &&
        ['assistant'].includes(o.role) &&
        typeof o.name === 'string' &&
        !!(o ??
            ((typeof o.audio === 'object' &&
                o.audio !== null &&
                typeof o.audio.id === 'string') ||
                o.audio === null ||
                o.audio === undefined)) &&
        isChatCompletionMessageToolCalls(o.tool_calls) &&
        !!(o ??
            ((typeof o.function_call === 'object' &&
                o.function_call !== null &&
                typeof o.function_call.arguments === 'string' &&
                typeof o.function_call.name === 'string') ||
                o.function_call === null ||
                o.function_call === undefined)));
}
function isChatCompletionRequestAssistantMessageContentPart(o) {
    return (isChatCompletionRequestMessageContentPartText(o) ||
        isChatCompletionRequestMessageContentPartRefusal(o));
}
function isChatCompletionRequestDeveloperMessage(o) {
    return ((typeof o === 'object' && o !== null && typeof o.content === 'string') ||
        (Array.isArray(o.content) &&
            o.content.every((contentItem) => isChatCompletionRequestMessageContentPartText(contentItem)) &&
            ['developer'].includes(o.role) &&
            typeof o.name === 'string'));
}
function isChatCompletionRequestFunctionMessage(o) {
    return ((typeof o === 'object' &&
        o !== null &&
        ['function'].includes(o.role) &&
        typeof o.content === 'string') ||
        ((o.content === null || o.content === undefined) &&
            typeof o.name === 'string'));
}
function isChatCompletionRequestMessageContentPartAudio(o) {
    return (typeof o === 'object' &&
        o !== null &&
        ['input_audio'].includes(o.type) &&
        typeof o.input_audio === 'object' &&
        o.input_audio !== null &&
        typeof o.input_audio.data === 'string' &&
        ['wav', 'mp3'].includes(o.input_audio.format));
}
function isChatCompletionRequestMessageContentPartFile(o) {
    return (typeof o === 'object' &&
        o !== null &&
        ['file'].includes(o.type) &&
        typeof o.file === 'object' &&
        o.file !== null &&
        typeof o.file.filename === 'string' &&
        typeof o.file.file_data === 'string' &&
        typeof o.file.file_id === 'string');
}
function isChatCompletionRequestMessageContentPartImage(o) {
    return (typeof o === 'object' &&
        o !== null &&
        ['image_url'].includes(o.type) &&
        typeof o.image_url === 'object' &&
        o.image_url !== null &&
        typeof o.image_url.url === 'string' &&
        ['auto', 'low', 'high'].includes(o.image_url.detail));
}
function isChatCompletionRequestMessageContentPartRefusal(o) {
    return (typeof o === 'object' &&
        o !== null &&
        ['refusal'].includes(o.type) &&
        typeof o.refusal === 'string');
}
function isChatCompletionRequestMessageContentPartText(o) {
    return (typeof o === 'object' &&
        o !== null &&
        ['text'].includes(o.type) &&
        typeof o.text === 'string');
}
function isChatCompletionRequestSystemMessage(o) {
    return ((typeof o === 'object' && o !== null && typeof o.content === 'string') ||
        (Array.isArray(o.content) &&
            o.content.every((contentItem) => isChatCompletionRequestSystemMessageContentPart(contentItem)) &&
            ['system'].includes(o.role) &&
            typeof o.name === 'string'));
}
function isChatCompletionRequestSystemMessageContentPart(o) {
    return isChatCompletionRequestMessageContentPartText(o);
}
function isChatCompletionRequestToolMessage(o) {
    return ((typeof o === 'object' &&
        o !== null &&
        ['tool'].includes(o.role) &&
        typeof o.content === 'string') ||
        (Array.isArray(o.content) &&
            o.content.every((contentItem) => isChatCompletionRequestToolMessageContentPart(contentItem)) &&
            typeof o.tool_call_id === 'string'));
}
function isChatCompletionRequestToolMessageContentPart(o) {
    return isChatCompletionRequestMessageContentPartText(o);
}
function isChatCompletionRequestUserMessage(o) {
    return ((typeof o === 'object' && o !== null && typeof o.content === 'string') ||
        (Array.isArray(o.content) &&
            o.content.every((contentItem) => isChatCompletionRequestUserMessageContentPart(contentItem)) &&
            ['user'].includes(o.role) &&
            typeof o.name === 'string'));
}
function isChatCompletionRequestUserMessageContentPart(o) {
    return (isChatCompletionRequestMessageContentPartText(o) ||
        isChatCompletionRequestMessageContentPartImage(o) ||
        isChatCompletionRequestMessageContentPartAudio(o) ||
        isChatCompletionRequestMessageContentPartFile(o));
}
function isChatCompletionResponseMessage(o) {
    return ((typeof o === 'object' && o !== null && typeof o.content === 'string') ||
        ((o.content === null || o.content === undefined) &&
            typeof o.refusal === 'string') ||
        ((o.refusal === null || o.refusal === undefined) &&
            isChatCompletionMessageToolCalls(o.tool_calls) &&
            Array.isArray(o.annotations) &&
            o.annotations.every((annotationsItem) => {
                return (typeof annotationsItem === 'object' &&
                    annotationsItem !== null &&
                    ['url_citation'].includes(annotationsItem.type) &&
                    typeof annotationsItem.url_citation === 'object' &&
                    annotationsItem.url_citation !== null &&
                    typeof annotationsItem.url_citation.end_index === 'number' &&
                    Number.isInteger(annotationsItem.url_citation.end_index) &&
                    typeof annotationsItem.url_citation.start_index === 'number' &&
                    Number.isInteger(annotationsItem.url_citation.start_index) &&
                    typeof annotationsItem.url_citation.url === 'string' &&
                    typeof annotationsItem.url_citation.title === 'string');
            }) &&
            ['assistant'].includes(o.role) &&
            typeof o.function_call === 'object' &&
            o.function_call !== null &&
            typeof o.function_call.arguments === 'string' &&
            typeof o.function_call.name === 'string' &&
            !!(o ??
                ((typeof o.audio === 'object' &&
                    o.audio !== null &&
                    typeof o.audio.id === 'string' &&
                    typeof o.audio.expires_at === 'number' &&
                    Number.isInteger(o.audio.expires_at) &&
                    typeof o.audio.data === 'string' &&
                    typeof o.audio.transcript === 'string') ||
                    o.audio === null ||
                    o.audio === undefined))));
}
function isChatCompletionStreamOptions(o) {
    return ((typeof o === 'object' &&
        o !== null &&
        typeof o.include_usage === 'boolean' &&
        typeof o.include_obfuscation === 'boolean') ||
        o === null ||
        o === undefined);
}
function isChatCompletionTokenLogprob(o) {
    return ((typeof o === 'object' &&
        o !== null &&
        typeof o.token === 'string' &&
        typeof o.logprob === 'number' &&
        Array.isArray(o.bytes) &&
        o.bytes.every((bytesItem) => {
            return typeof bytesItem === 'number' && Number.isInteger(bytesItem);
        })) ||
        ((o.bytes === null || o.bytes === undefined) &&
            Array.isArray(o.top_logprobs) &&
            o.top_logprobs.every((top_logprobsItem) => {
                return ((typeof top_logprobsItem === 'object' &&
                    top_logprobsItem !== null &&
                    typeof top_logprobsItem.token === 'string' &&
                    typeof top_logprobsItem.logprob === 'number' &&
                    Array.isArray(top_logprobsItem.bytes) &&
                    top_logprobsItem.bytes.every((bytesItem) => {
                        return (typeof bytesItem === 'number' && Number.isInteger(bytesItem));
                    })) ||
                    top_logprobsItem.bytes === null ||
                    top_logprobsItem.bytes === undefined);
            })));
}
function isChatCompletionTool(o) {
    return (typeof o === 'object' &&
        o !== null &&
        ['function'].includes(o.type) &&
        isFunctionObject(o.function));
}
function isChatCompletionToolChoiceOption(o) {
    return (['none', 'auto', 'required'].includes(o) ||
        isChatCompletionAllowedToolsChoice(o) ||
        isChatCompletionNamedToolChoice(o) ||
        isChatCompletionNamedToolChoiceCustom(o));
}
function isCompletionUsage(o) {
    return (typeof o === 'object' &&
        o !== null &&
        typeof o.completion_tokens === 'number' &&
        Number.isInteger(o.completion_tokens) &&
        typeof o.prompt_tokens === 'number' &&
        Number.isInteger(o.prompt_tokens) &&
        typeof o.total_tokens === 'number' &&
        Number.isInteger(o.total_tokens) &&
        typeof o.completion_tokens_details === 'object' &&
        o.completion_tokens_details !== null &&
        typeof o.completion_tokens_details.accepted_prediction_tokens ===
            'number' &&
        Number.isInteger(o.completion_tokens_details.accepted_prediction_tokens) &&
        typeof o.completion_tokens_details.audio_tokens === 'number' &&
        Number.isInteger(o.completion_tokens_details.audio_tokens) &&
        typeof o.completion_tokens_details.reasoning_tokens === 'number' &&
        Number.isInteger(o.completion_tokens_details.reasoning_tokens) &&
        typeof o.completion_tokens_details.rejected_prediction_tokens ===
            'number' &&
        Number.isInteger(o.completion_tokens_details.rejected_prediction_tokens) &&
        typeof o.prompt_tokens_details === 'object' &&
        o.prompt_tokens_details !== null &&
        typeof o.prompt_tokens_details.audio_tokens === 'number' &&
        Number.isInteger(o.prompt_tokens_details.audio_tokens) &&
        typeof o.prompt_tokens_details.cached_tokens === 'number' &&
        Number.isInteger(o.prompt_tokens_details.cached_tokens));
}
function isCreateModelResponseProperties(o) {
    return (typeof o === 'object' &&
        typeof o === 'object' &&
        o !== null &&
        isMetadata(o.metadata) &&
        !!(o ??
            ((typeof o.top_logprobs === 'number' &&
                o.top_logprobs <= 20 &&
                Number.isInteger(o.top_logprobs)) ||
                o.top_logprobs === null ||
                o.top_logprobs === undefined)) &&
        !!(o ??
            ((typeof o.temperature === 'number' && o.temperature <= 2) ||
                o.temperature === null ||
                o.temperature === undefined)) &&
        !!(o ??
            ((typeof o.top_p === 'number' && o.top_p <= 1) ||
                o.top_p === null ||
                o.top_p === undefined)) &&
        typeof o.user === 'string' &&
        typeof o.safety_identifier === 'string' &&
        typeof o.prompt_cache_key === 'string' &&
        isServiceTier(o.service_tier) &&
        !!(o ??
            (['in_memory', '24h'].includes(o.prompt_cache_retention) ||
                o.prompt_cache_retention === null ||
                o.prompt_cache_retention === undefined)) &&
        o !== null &&
        typeof o.top_logprobs === 'number' &&
        o.top_logprobs <= 20 &&
        Number.isInteger(o.top_logprobs));
}
function isCustomToolChatCompletions(o) {
    return (typeof o === 'object' &&
        o !== null &&
        ['custom'].includes(o.type) &&
        typeof o.custom === 'object' &&
        o.custom !== null &&
        typeof o.custom.name === 'string' &&
        typeof o.custom.description === 'string' &&
        !!(o.custom ??
            ((typeof o.custom.format === 'object' &&
                o.custom.format !== null &&
                ['text'].includes(o.custom.format.type)) ||
                (typeof o.custom.format === 'object' &&
                    o.custom.format !== null &&
                    ['grammar'].includes(o.custom.format.type) &&
                    typeof o.custom.format.grammar === 'object' &&
                    o.custom.format.grammar !== null &&
                    typeof o.custom.format.grammar.definition === 'string' &&
                    ['lark', 'regex'].includes(o.custom.format.grammar.syntax)))));
}
function isFunctionObject(o) {
    return (typeof o === 'object' &&
        o !== null &&
        typeof o.description === 'string' &&
        typeof o.name === 'string' &&
        isFunctionParameters(o.parameters) &&
        !!(o ??
            (typeof o.strict === 'boolean' ||
                o.strict === null ||
                o.strict === undefined)));
}
function isFunctionParameters(o) {
    return typeof o === 'object' && o !== null;
}
function isMetadata(o) {
    return (typeof o === 'object' && o !== null) || o === null || o === undefined;
}
function isModelIdsShared(o) {
    return (typeof o === 'string' || ['default', 'classify', 'escalate'].includes(o));
}
function isModelResponseProperties(o) {
    return (typeof o === 'object' &&
        o !== null &&
        isMetadata(o.metadata) &&
        !!(o ??
            ((typeof o.top_logprobs === 'number' &&
                o.top_logprobs <= 20 &&
                Number.isInteger(o.top_logprobs)) ||
                o.top_logprobs === null ||
                o.top_logprobs === undefined)) &&
        !!(o ??
            ((typeof o.temperature === 'number' && o.temperature <= 2) ||
                o.temperature === null ||
                o.temperature === undefined)) &&
        !!(o ??
            ((typeof o.top_p === 'number' && o.top_p <= 1) ||
                o.top_p === null ||
                o.top_p === undefined)) &&
        typeof o.user === 'string' &&
        typeof o.safety_identifier === 'string' &&
        typeof o.prompt_cache_key === 'string' &&
        isServiceTier(o.service_tier) &&
        !!(o ??
            (['in_memory', '24h'].includes(o.prompt_cache_retention) ||
                o.prompt_cache_retention === null ||
                o.prompt_cache_retention === undefined)));
}
function isParallelToolCalls(o) {
    return typeof o === 'boolean';
}
function isPredictionContent(o) {
    return ((typeof o === 'object' &&
        o !== null &&
        ['content'].includes(o.type) &&
        typeof o.content === 'string') ||
        (Array.isArray(o.content) &&
            o.content.every((contentItem) => isChatCompletionRequestMessageContentPartText(contentItem))));
}
function isResponseFormatJsonSchemaSchema(o) {
    return typeof o === 'object' && o !== null;
}
function isResponseModalities(o) {
    return ((Array.isArray(o) &&
        o.every((oItem) => ['text', 'audio'].includes(oItem))) ||
        o === null ||
        o === undefined);
}
function isServiceTier(o) {
    return (['auto', 'default', 'flex', 'scale', 'priority'].includes(o) ||
        o === null ||
        o === undefined);
}
function isStopConfiguration(o) {
    return (o === null ||
        o === null ||
        typeof o === 'string' ||
        (Array.isArray(o) && o.every((oItem) => typeof oItem === 'string')));
}
function isVerbosity(o) {
    return ['low', 'medium', 'high'].includes(o) || o === null || o === undefined;
}
function isWebSearchContextSize(o) {
    return ['low', 'medium', 'high'].includes(o);
}
function isWebSearchLocation(o) {
    return (typeof o === 'object' &&
        o !== null &&
        typeof o.country === 'string' &&
        typeof o.region === 'string' &&
        typeof o.city === 'string' &&
        typeof o.timezone === 'string');
}
//# sourceMappingURL=openai-types.js.map