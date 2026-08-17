/**
 * @module openai-types
 * Schemas from the OpenAI swaggar translated into types, interfaces, and
 * runtime validators for TypeScript. Only the types requested for export are
 * actually exported, and only the same plus all their dependencies are
 * generated.
 */
export function validateChatCompletionRequestMessage(o, path) {
    return checkNamed('ChatCompletionRequestMessage', o, path);
}
export function validateChatCompletionStreamResponseDelta(o, path) {
    return checkNamed('ChatCompletionStreamResponseDelta', o, path);
}
export function validateCreateChatCompletionRequest(o, path) {
    return checkNamed('CreateChatCompletionRequest', o, path);
}
export function validateCreateChatCompletionResponse(o, path) {
    return checkNamed('CreateChatCompletionResponse', o, path);
}
export function validateCreateChatCompletionStreamResponse(o, path) {
    return checkNamed('CreateChatCompletionStreamResponse', o, path);
}
export function validateReasoningEffort(o, path) {
    return checkNamed('ReasoningEffort', o, path);
}
export function validateResponseFormatJsonObject(o, path) {
    return checkNamed('ResponseFormatJsonObject', o, path);
}
export function validateResponseFormatJsonSchema(o, path) {
    return checkNamed('ResponseFormatJsonSchema', o, path);
}
export function validateResponseFormatText(o, path) {
    return checkNamed('ResponseFormatText', o, path);
}
const validationSpecs = {
    ModelIdsShared: {
        type: 'anyOf',
        union: [
            {
                type: 'string',
            },
            {
                type: 'string',
                enum: ['default', 'classify', 'escalate'],
            },
        ],
    },
    ChatCompletionRequestMessage: {
        type: 'oneOf',
        union: [
            {
                type: 'ref',
                ref: 'ChatCompletionRequestDeveloperMessage',
            },
            {
                type: 'ref',
                ref: 'ChatCompletionRequestSystemMessage',
            },
            {
                type: 'ref',
                ref: 'ChatCompletionRequestUserMessage',
            },
            {
                type: 'ref',
                ref: 'ChatCompletionRequestAssistantMessage',
            },
            {
                type: 'ref',
                ref: 'ChatCompletionRequestToolMessage',
            },
            {
                type: 'ref',
                ref: 'ChatCompletionRequestFunctionMessage',
            },
        ],
    },
    ChatCompletionStreamResponseDelta: {
        type: 'object',
        object: {
            properties: {
                content: {
                    required: false,
                    spec: {
                        type: 'anyOf',
                        union: [
                            {
                                type: 'string',
                            },
                            {
                                type: 'null',
                            },
                        ],
                    },
                },
                function_call: {
                    required: false,
                    spec: {
                        type: 'object',
                        object: {
                            properties: {
                                arguments: {
                                    required: false,
                                    spec: {
                                        type: 'string',
                                    },
                                },
                                name: {
                                    required: false,
                                    spec: {
                                        type: 'string',
                                    },
                                },
                            },
                            additionalProperties: false,
                        },
                    },
                },
                tool_calls: {
                    required: false,
                    spec: {
                        type: 'array',
                        items: {
                            type: 'ref',
                            ref: 'ChatCompletionMessageToolCallChunk',
                        },
                    },
                },
                role: {
                    required: false,
                    spec: {
                        type: 'string',
                        enum: ['developer', 'system', 'user', 'assistant', 'tool'],
                    },
                },
                refusal: {
                    required: false,
                    spec: {
                        type: 'anyOf',
                        union: [
                            {
                                type: 'string',
                            },
                            {
                                type: 'null',
                            },
                        ],
                    },
                },
            },
            additionalProperties: false,
        },
    },
    CreateChatCompletionResponse: {
        type: 'object',
        object: {
            properties: {
                id: {
                    required: true,
                    spec: {
                        type: 'string',
                    },
                },
                choices: {
                    required: true,
                    spec: {
                        type: 'array',
                        items: {
                            type: 'object',
                            object: {
                                properties: {
                                    finish_reason: {
                                        required: true,
                                        spec: {
                                            type: 'string',
                                            enum: [
                                                'stop',
                                                'length',
                                                'tool_calls',
                                                'content_filter',
                                                'function_call',
                                            ],
                                        },
                                    },
                                    index: {
                                        required: true,
                                        spec: {
                                            type: 'integer',
                                        },
                                    },
                                    message: {
                                        required: true,
                                        spec: {
                                            type: 'ref',
                                            ref: 'ChatCompletionResponseMessage',
                                        },
                                    },
                                    logprobs: {
                                        required: true,
                                        spec: {
                                            type: 'anyOf',
                                            union: [
                                                {
                                                    type: 'object',
                                                    object: {
                                                        properties: {
                                                            content: {
                                                                required: true,
                                                                spec: {
                                                                    type: 'anyOf',
                                                                    union: [
                                                                        {
                                                                            type: 'array',
                                                                            items: {
                                                                                type: 'ref',
                                                                                ref: 'ChatCompletionTokenLogprob',
                                                                            },
                                                                        },
                                                                        {
                                                                            type: 'null',
                                                                        },
                                                                    ],
                                                                },
                                                            },
                                                            refusal: {
                                                                required: true,
                                                                spec: {
                                                                    type: 'anyOf',
                                                                    union: [
                                                                        {
                                                                            type: 'array',
                                                                            items: {
                                                                                type: 'ref',
                                                                                ref: 'ChatCompletionTokenLogprob',
                                                                            },
                                                                        },
                                                                        {
                                                                            type: 'null',
                                                                        },
                                                                    ],
                                                                },
                                                            },
                                                        },
                                                        additionalProperties: false,
                                                    },
                                                },
                                                {
                                                    type: 'null',
                                                },
                                            ],
                                        },
                                    },
                                },
                                additionalProperties: false,
                            },
                        },
                    },
                },
                created: {
                    required: true,
                    spec: {
                        type: 'integer',
                    },
                },
                model: {
                    required: true,
                    spec: {
                        type: 'string',
                    },
                },
                service_tier: {
                    required: false,
                    spec: {
                        type: 'ref',
                        ref: 'ServiceTier',
                    },
                },
                system_fingerprint: {
                    required: false,
                    spec: {
                        type: 'string',
                    },
                },
                object: {
                    required: true,
                    spec: {
                        type: 'string',
                        enum: ['chat.completion'],
                    },
                },
                usage: {
                    required: false,
                    spec: {
                        type: 'ref',
                        ref: 'CompletionUsage',
                    },
                },
            },
            additionalProperties: false,
        },
    },
    CreateChatCompletionStreamResponse: {
        type: 'object',
        object: {
            properties: {
                id: {
                    required: true,
                    spec: {
                        type: 'string',
                    },
                },
                choices: {
                    required: true,
                    spec: {
                        type: 'array',
                        items: {
                            type: 'object',
                            object: {
                                properties: {
                                    delta: {
                                        required: true,
                                        spec: {
                                            type: 'ref',
                                            ref: 'ChatCompletionStreamResponseDelta',
                                        },
                                    },
                                    logprobs: {
                                        required: false,
                                        spec: {
                                            type: 'object',
                                            nullable: true,
                                            object: {
                                                properties: {
                                                    content: {
                                                        required: true,
                                                        spec: {
                                                            type: 'array',
                                                            nullable: true,
                                                            items: {
                                                                type: 'ref',
                                                                ref: 'ChatCompletionTokenLogprob',
                                                            },
                                                        },
                                                    },
                                                    refusal: {
                                                        required: true,
                                                        spec: {
                                                            type: 'array',
                                                            nullable: true,
                                                            items: {
                                                                type: 'ref',
                                                                ref: 'ChatCompletionTokenLogprob',
                                                            },
                                                        },
                                                    },
                                                },
                                                additionalProperties: false,
                                            },
                                        },
                                    },
                                    finish_reason: {
                                        required: true,
                                        spec: {
                                            type: 'string',
                                            nullable: true,
                                            enum: [
                                                'stop',
                                                'length',
                                                'tool_calls',
                                                'content_filter',
                                                'function_call',
                                            ],
                                        },
                                    },
                                    index: {
                                        required: true,
                                        spec: {
                                            type: 'integer',
                                        },
                                    },
                                },
                                additionalProperties: false,
                            },
                        },
                    },
                },
                created: {
                    required: true,
                    spec: {
                        type: 'integer',
                    },
                },
                model: {
                    required: true,
                    spec: {
                        type: 'string',
                    },
                },
                service_tier: {
                    required: false,
                    spec: {
                        type: 'ref',
                        ref: 'ServiceTier',
                    },
                },
                system_fingerprint: {
                    required: false,
                    spec: {
                        type: 'string',
                    },
                },
                object: {
                    required: true,
                    spec: {
                        type: 'string',
                        enum: ['chat.completion.chunk'],
                    },
                },
                usage: {
                    required: false,
                    spec: {
                        type: 'ref',
                        ref: 'CompletionUsage',
                    },
                },
            },
            additionalProperties: false,
        },
    },
    CreateChatCompletionRequest: {
        type: 'object',
        extends: 'CreateModelResponseProperties',
        object: {
            properties: {
                messages: {
                    required: true,
                    spec: {
                        type: 'array',
                        minItems: 1,
                        items: {
                            type: 'ref',
                            ref: 'ChatCompletionRequestMessage',
                        },
                    },
                },
                model: {
                    required: true,
                    spec: {
                        type: 'ref',
                        ref: 'ModelIdsShared',
                    },
                },
                modalities: {
                    required: false,
                    spec: {
                        type: 'ref',
                        ref: 'ResponseModalities',
                    },
                },
                verbosity: {
                    required: false,
                    spec: {
                        type: 'ref',
                        ref: 'Verbosity',
                    },
                },
                reasoning_effort: {
                    required: false,
                    spec: {
                        type: 'ref',
                        ref: 'ReasoningEffort',
                    },
                },
                max_completion_tokens: {
                    required: false,
                    spec: {
                        type: 'integer',
                        nullable: true,
                    },
                },
                frequency_penalty: {
                    required: false,
                    spec: {
                        type: 'float',
                        nullable: true,
                        minimum: -2,
                        maximum: 2,
                    },
                },
                presence_penalty: {
                    required: false,
                    spec: {
                        type: 'float',
                        nullable: true,
                        minimum: -2,
                        maximum: 2,
                    },
                },
                web_search_options: {
                    required: false,
                    spec: {
                        type: 'object',
                        object: {
                            properties: {
                                user_location: {
                                    required: false,
                                    spec: {
                                        type: 'object',
                                        nullable: true,
                                        object: {
                                            properties: {
                                                type: {
                                                    required: true,
                                                    spec: {
                                                        type: 'string',
                                                        enum: ['approximate'],
                                                    },
                                                },
                                                approximate: {
                                                    required: true,
                                                    spec: {
                                                        type: 'ref',
                                                        ref: 'WebSearchLocation',
                                                    },
                                                },
                                            },
                                            additionalProperties: false,
                                        },
                                    },
                                },
                                search_context_size: {
                                    required: false,
                                    spec: {
                                        type: 'ref',
                                        ref: 'WebSearchContextSize',
                                    },
                                },
                            },
                            additionalProperties: false,
                        },
                    },
                },
                top_logprobs: {
                    required: false,
                    spec: {
                        type: 'integer',
                        nullable: true,
                        maximum: 20,
                    },
                },
                response_format: {
                    required: false,
                    spec: {
                        type: 'oneOf',
                        union: [
                            {
                                type: 'ref',
                                ref: 'ResponseFormatText',
                            },
                            {
                                type: 'ref',
                                ref: 'ResponseFormatJsonSchema',
                            },
                            {
                                type: 'ref',
                                ref: 'ResponseFormatJsonObject',
                            },
                        ],
                    },
                },
                store: {
                    required: false,
                    spec: {
                        type: 'boolean',
                        nullable: true,
                    },
                },
                stream: {
                    required: false,
                    spec: {
                        type: 'boolean',
                        nullable: true,
                    },
                },
                stop: {
                    required: false,
                    spec: {
                        type: 'ref',
                        ref: 'StopConfiguration',
                    },
                },
                logit_bias: {
                    required: false,
                    spec: {
                        type: 'object',
                        nullable: true,
                        object: {
                            properties: {},
                            additionalProperties: 'integer',
                        },
                    },
                },
                logprobs: {
                    required: false,
                    spec: {
                        type: 'boolean',
                        nullable: true,
                    },
                },
                max_tokens: {
                    required: false,
                    spec: {
                        type: 'integer',
                        nullable: true,
                    },
                },
                n: {
                    required: false,
                    spec: {
                        type: 'integer',
                        nullable: true,
                        minimum: 1,
                        maximum: 128,
                    },
                },
                prediction: {
                    required: false,
                    spec: {
                        type: 'oneOf',
                        nullable: true,
                        union: [
                            {
                                type: 'ref',
                                ref: 'PredictionContent',
                            },
                        ],
                    },
                },
                seed: {
                    required: false,
                    spec: {
                        type: 'integer',
                        nullable: true,
                        minimum: -9223372036854776000,
                        maximum: 9223372036854776000,
                    },
                },
                stream_options: {
                    required: false,
                    spec: {
                        type: 'ref',
                        ref: 'ChatCompletionStreamOptions',
                    },
                },
                tools: {
                    required: false,
                    spec: {
                        type: 'array',
                        items: {
                            type: 'oneOf',
                            union: [
                                {
                                    type: 'ref',
                                    ref: 'ChatCompletionTool',
                                },
                                {
                                    type: 'ref',
                                    ref: 'CustomToolChatCompletions',
                                },
                            ],
                        },
                    },
                },
                tool_choice: {
                    required: false,
                    spec: {
                        type: 'ref',
                        ref: 'ChatCompletionToolChoiceOption',
                    },
                },
                parallel_tool_calls: {
                    required: false,
                    spec: {
                        type: 'ref',
                        ref: 'ParallelToolCalls',
                    },
                },
                function_call: {
                    required: false,
                    spec: {
                        type: 'oneOf',
                        union: [
                            {
                                type: 'string',
                                enum: ['none', 'auto'],
                            },
                            {
                                type: 'ref',
                                ref: 'ChatCompletionFunctionCallOption',
                            },
                        ],
                    },
                },
                functions: {
                    required: false,
                    spec: {
                        type: 'array',
                        minItems: 1,
                        items: {
                            type: 'ref',
                            ref: 'ChatCompletionFunctions',
                        },
                    },
                },
            },
            additionalProperties: false,
        },
    },
    ReasoningEffort: {
        type: 'anyOf',
        union: [
            {
                type: 'string',
                enum: ['none', 'minimal', 'low', 'medium', 'high', 'xhigh'],
            },
            {
                type: 'null',
            },
        ],
    },
    ResponseFormatText: {
        type: 'object',
        object: {
            properties: {
                type: {
                    required: true,
                    spec: {
                        type: 'string',
                        enum: ['text'],
                    },
                },
            },
            additionalProperties: false,
        },
    },
    ResponseFormatJsonSchema: {
        type: 'object',
        object: {
            properties: {
                type: {
                    required: true,
                    spec: {
                        type: 'string',
                        enum: ['json_schema'],
                    },
                },
                json_schema: {
                    required: true,
                    spec: {
                        type: 'object',
                        object: {
                            properties: {
                                description: {
                                    required: false,
                                    spec: {
                                        type: 'string',
                                    },
                                },
                                name: {
                                    required: true,
                                    spec: {
                                        type: 'string',
                                    },
                                },
                                schema: {
                                    required: false,
                                    spec: {
                                        type: 'ref',
                                        ref: 'ResponseFormatJsonSchemaSchema',
                                    },
                                },
                                strict: {
                                    required: false,
                                    spec: {
                                        type: 'anyOf',
                                        union: [
                                            {
                                                type: 'boolean',
                                            },
                                            {
                                                type: 'null',
                                            },
                                        ],
                                    },
                                },
                            },
                            additionalProperties: false,
                        },
                    },
                },
            },
            additionalProperties: false,
        },
    },
    ResponseFormatJsonObject: {
        type: 'object',
        object: {
            properties: {
                type: {
                    required: true,
                    spec: {
                        type: 'string',
                        enum: ['json_object'],
                    },
                },
            },
            additionalProperties: false,
        },
    },
    ChatCompletionRequestDeveloperMessage: {
        type: 'object',
        object: {
            properties: {
                content: {
                    required: true,
                    spec: {
                        type: 'oneOf',
                        union: [
                            {
                                type: 'string',
                            },
                            {
                                type: 'array',
                                minItems: 1,
                                items: {
                                    type: 'ref',
                                    ref: 'ChatCompletionRequestMessageContentPartText',
                                },
                            },
                        ],
                    },
                },
                role: {
                    required: true,
                    spec: {
                        type: 'string',
                        enum: ['developer'],
                    },
                },
                name: {
                    required: false,
                    spec: {
                        type: 'string',
                    },
                },
            },
            additionalProperties: false,
        },
    },
    ChatCompletionRequestSystemMessage: {
        type: 'object',
        object: {
            properties: {
                content: {
                    required: true,
                    spec: {
                        type: 'oneOf',
                        union: [
                            {
                                type: 'string',
                            },
                            {
                                type: 'array',
                                minItems: 1,
                                items: {
                                    type: 'ref',
                                    ref: 'ChatCompletionRequestSystemMessageContentPart',
                                },
                            },
                        ],
                    },
                },
                role: {
                    required: true,
                    spec: {
                        type: 'string',
                        enum: ['system'],
                    },
                },
                name: {
                    required: false,
                    spec: {
                        type: 'string',
                    },
                },
            },
            additionalProperties: false,
        },
    },
    ChatCompletionRequestUserMessage: {
        type: 'object',
        object: {
            properties: {
                content: {
                    required: true,
                    spec: {
                        type: 'oneOf',
                        union: [
                            {
                                type: 'string',
                            },
                            {
                                type: 'array',
                                minItems: 1,
                                items: {
                                    type: 'ref',
                                    ref: 'ChatCompletionRequestUserMessageContentPart',
                                },
                            },
                        ],
                    },
                },
                role: {
                    required: true,
                    spec: {
                        type: 'string',
                        enum: ['user'],
                    },
                },
                name: {
                    required: false,
                    spec: {
                        type: 'string',
                    },
                },
            },
            additionalProperties: false,
        },
    },
    ChatCompletionRequestAssistantMessage: {
        type: 'object',
        object: {
            properties: {
                content: {
                    required: false,
                    spec: {
                        type: 'anyOf',
                        union: [
                            {
                                type: 'oneOf',
                                union: [
                                    {
                                        type: 'string',
                                    },
                                    {
                                        type: 'array',
                                        minItems: 1,
                                        items: {
                                            type: 'ref',
                                            ref: 'ChatCompletionRequestAssistantMessageContentPart',
                                        },
                                    },
                                ],
                            },
                            {
                                type: 'null',
                            },
                        ],
                    },
                },
                refusal: {
                    required: false,
                    spec: {
                        type: 'anyOf',
                        union: [
                            {
                                type: 'string',
                            },
                            {
                                type: 'null',
                            },
                        ],
                    },
                },
                role: {
                    required: true,
                    spec: {
                        type: 'string',
                        enum: ['assistant'],
                    },
                },
                name: {
                    required: false,
                    spec: {
                        type: 'string',
                    },
                },
                audio: {
                    required: false,
                    spec: {
                        type: 'anyOf',
                        union: [
                            {
                                type: 'object',
                                object: {
                                    properties: {
                                        id: {
                                            required: true,
                                            spec: {
                                                type: 'string',
                                            },
                                        },
                                    },
                                    additionalProperties: false,
                                },
                            },
                            {
                                type: 'null',
                            },
                        ],
                    },
                },
                tool_calls: {
                    required: false,
                    spec: {
                        type: 'ref',
                        ref: 'ChatCompletionMessageToolCalls',
                    },
                },
                function_call: {
                    required: false,
                    spec: {
                        type: 'anyOf',
                        union: [
                            {
                                type: 'object',
                                object: {
                                    properties: {
                                        arguments: {
                                            required: true,
                                            spec: {
                                                type: 'string',
                                            },
                                        },
                                        name: {
                                            required: true,
                                            spec: {
                                                type: 'string',
                                            },
                                        },
                                    },
                                    additionalProperties: false,
                                },
                            },
                            {
                                type: 'null',
                            },
                        ],
                    },
                },
            },
            additionalProperties: false,
        },
    },
    ChatCompletionRequestToolMessage: {
        type: 'object',
        object: {
            properties: {
                role: {
                    required: true,
                    spec: {
                        type: 'string',
                        enum: ['tool'],
                    },
                },
                content: {
                    required: true,
                    spec: {
                        type: 'oneOf',
                        union: [
                            {
                                type: 'string',
                            },
                            {
                                type: 'array',
                                minItems: 1,
                                items: {
                                    type: 'ref',
                                    ref: 'ChatCompletionRequestToolMessageContentPart',
                                },
                            },
                        ],
                    },
                },
                tool_call_id: {
                    required: true,
                    spec: {
                        type: 'string',
                    },
                },
            },
            additionalProperties: false,
        },
    },
    ChatCompletionRequestFunctionMessage: {
        type: 'object',
        object: {
            properties: {
                role: {
                    required: true,
                    spec: {
                        type: 'string',
                        enum: ['function'],
                    },
                },
                content: {
                    required: true,
                    spec: {
                        type: 'anyOf',
                        union: [
                            {
                                type: 'string',
                            },
                            {
                                type: 'null',
                            },
                        ],
                    },
                },
                name: {
                    required: true,
                    spec: {
                        type: 'string',
                    },
                },
            },
            additionalProperties: false,
        },
    },
    ChatCompletionMessageToolCallChunk: {
        type: 'object',
        object: {
            properties: {
                index: {
                    required: true,
                    spec: {
                        type: 'integer',
                    },
                },
                id: {
                    required: false,
                    spec: {
                        type: 'string',
                    },
                },
                type: {
                    required: false,
                    spec: {
                        type: 'string',
                        enum: ['function'],
                    },
                },
                function: {
                    required: false,
                    spec: {
                        type: 'object',
                        object: {
                            properties: {
                                name: {
                                    required: false,
                                    spec: {
                                        type: 'string',
                                    },
                                },
                                arguments: {
                                    required: false,
                                    spec: {
                                        type: 'string',
                                    },
                                },
                            },
                            additionalProperties: false,
                        },
                    },
                },
            },
            additionalProperties: false,
        },
    },
    ChatCompletionResponseMessage: {
        type: 'object',
        object: {
            properties: {
                content: {
                    required: true,
                    spec: {
                        type: 'anyOf',
                        union: [
                            {
                                type: 'string',
                            },
                            {
                                type: 'null',
                            },
                        ],
                    },
                },
                refusal: {
                    required: true,
                    spec: {
                        type: 'anyOf',
                        union: [
                            {
                                type: 'string',
                            },
                            {
                                type: 'null',
                            },
                        ],
                    },
                },
                tool_calls: {
                    required: false,
                    spec: {
                        type: 'ref',
                        ref: 'ChatCompletionMessageToolCalls',
                    },
                },
                annotations: {
                    required: false,
                    spec: {
                        type: 'array',
                        items: {
                            type: 'object',
                            object: {
                                properties: {
                                    type: {
                                        required: true,
                                        spec: {
                                            type: 'string',
                                            enum: ['url_citation'],
                                        },
                                    },
                                    url_citation: {
                                        required: true,
                                        spec: {
                                            type: 'object',
                                            object: {
                                                properties: {
                                                    end_index: {
                                                        required: true,
                                                        spec: {
                                                            type: 'integer',
                                                        },
                                                    },
                                                    start_index: {
                                                        required: true,
                                                        spec: {
                                                            type: 'integer',
                                                        },
                                                    },
                                                    url: {
                                                        required: true,
                                                        spec: {
                                                            type: 'string',
                                                        },
                                                    },
                                                    title: {
                                                        required: true,
                                                        spec: {
                                                            type: 'string',
                                                        },
                                                    },
                                                },
                                                additionalProperties: false,
                                            },
                                        },
                                    },
                                },
                                additionalProperties: false,
                            },
                        },
                    },
                },
                role: {
                    required: true,
                    spec: {
                        type: 'string',
                        enum: ['assistant'],
                    },
                },
                function_call: {
                    required: false,
                    spec: {
                        type: 'object',
                        object: {
                            properties: {
                                arguments: {
                                    required: true,
                                    spec: {
                                        type: 'string',
                                    },
                                },
                                name: {
                                    required: true,
                                    spec: {
                                        type: 'string',
                                    },
                                },
                            },
                            additionalProperties: false,
                        },
                    },
                },
                audio: {
                    required: false,
                    spec: {
                        type: 'anyOf',
                        union: [
                            {
                                type: 'object',
                                object: {
                                    properties: {
                                        id: {
                                            required: true,
                                            spec: {
                                                type: 'string',
                                            },
                                        },
                                        expires_at: {
                                            required: true,
                                            spec: {
                                                type: 'integer',
                                            },
                                        },
                                        data: {
                                            required: true,
                                            spec: {
                                                type: 'string',
                                            },
                                        },
                                        transcript: {
                                            required: true,
                                            spec: {
                                                type: 'string',
                                            },
                                        },
                                    },
                                    additionalProperties: false,
                                },
                            },
                            {
                                type: 'null',
                            },
                        ],
                    },
                },
            },
            additionalProperties: false,
        },
    },
    ChatCompletionTokenLogprob: {
        type: 'object',
        object: {
            properties: {
                token: {
                    required: true,
                    spec: {
                        type: 'string',
                    },
                },
                logprob: {
                    required: true,
                    spec: {
                        type: 'float',
                    },
                },
                bytes: {
                    required: true,
                    spec: {
                        type: 'anyOf',
                        union: [
                            {
                                type: 'array',
                                items: {
                                    type: 'integer',
                                },
                            },
                            {
                                type: 'null',
                            },
                        ],
                    },
                },
                top_logprobs: {
                    required: true,
                    spec: {
                        type: 'array',
                        items: {
                            type: 'object',
                            object: {
                                properties: {
                                    token: {
                                        required: true,
                                        spec: {
                                            type: 'string',
                                        },
                                    },
                                    logprob: {
                                        required: true,
                                        spec: {
                                            type: 'float',
                                        },
                                    },
                                    bytes: {
                                        required: true,
                                        spec: {
                                            type: 'anyOf',
                                            union: [
                                                {
                                                    type: 'array',
                                                    items: {
                                                        type: 'integer',
                                                    },
                                                },
                                                {
                                                    type: 'null',
                                                },
                                            ],
                                        },
                                    },
                                },
                                additionalProperties: false,
                            },
                        },
                    },
                },
            },
            additionalProperties: false,
        },
    },
    ServiceTier: {
        type: 'anyOf',
        union: [
            {
                type: 'string',
                enum: ['auto', 'default', 'flex', 'scale', 'priority'],
            },
            {
                type: 'null',
            },
        ],
    },
    CompletionUsage: {
        type: 'object',
        object: {
            properties: {
                completion_tokens: {
                    required: true,
                    spec: {
                        type: 'integer',
                    },
                },
                prompt_tokens: {
                    required: true,
                    spec: {
                        type: 'integer',
                    },
                },
                total_tokens: {
                    required: true,
                    spec: {
                        type: 'integer',
                    },
                },
                completion_tokens_details: {
                    required: false,
                    spec: {
                        type: 'object',
                        object: {
                            properties: {
                                accepted_prediction_tokens: {
                                    required: false,
                                    spec: {
                                        type: 'integer',
                                    },
                                },
                                audio_tokens: {
                                    required: false,
                                    spec: {
                                        type: 'integer',
                                    },
                                },
                                reasoning_tokens: {
                                    required: false,
                                    spec: {
                                        type: 'integer',
                                    },
                                },
                                rejected_prediction_tokens: {
                                    required: false,
                                    spec: {
                                        type: 'integer',
                                    },
                                },
                            },
                            additionalProperties: false,
                        },
                    },
                },
                prompt_tokens_details: {
                    required: false,
                    spec: {
                        type: 'object',
                        object: {
                            properties: {
                                audio_tokens: {
                                    required: false,
                                    spec: {
                                        type: 'integer',
                                    },
                                },
                                cached_tokens: {
                                    required: false,
                                    spec: {
                                        type: 'integer',
                                    },
                                },
                            },
                            additionalProperties: false,
                        },
                    },
                },
            },
            additionalProperties: false,
        },
    },
    CreateModelResponseProperties: {
        type: 'object',
        extends: 'ModelResponseProperties',
        object: {
            properties: {
                top_logprobs: {
                    required: false,
                    spec: {
                        type: 'integer',
                        maximum: 20,
                    },
                },
            },
            additionalProperties: false,
        },
    },
    ResponseModalities: {
        type: 'anyOf',
        union: [
            {
                type: 'array',
                items: {
                    type: 'string',
                    enum: ['text', 'audio'],
                },
            },
            {
                type: 'null',
            },
        ],
    },
    Verbosity: {
        type: 'anyOf',
        union: [
            {
                type: 'string',
                enum: ['low', 'medium', 'high'],
            },
            {
                type: 'null',
            },
        ],
    },
    WebSearchLocation: {
        type: 'object',
        object: {
            properties: {
                country: {
                    required: false,
                    spec: {
                        type: 'string',
                    },
                },
                region: {
                    required: false,
                    spec: {
                        type: 'string',
                    },
                },
                city: {
                    required: false,
                    spec: {
                        type: 'string',
                    },
                },
                timezone: {
                    required: false,
                    spec: {
                        type: 'string',
                    },
                },
            },
            additionalProperties: false,
        },
    },
    WebSearchContextSize: {
        type: 'string',
        enum: ['low', 'medium', 'high'],
    },
    StopConfiguration: {
        type: 'oneOf',
        nullable: true,
        union: [
            {
                type: 'string',
                nullable: true,
            },
            {
                type: 'array',
                minItems: 1,
                items: {
                    type: 'string',
                },
            },
        ],
    },
    PredictionContent: {
        type: 'object',
        object: {
            properties: {
                type: {
                    required: true,
                    spec: {
                        type: 'string',
                        enum: ['content'],
                    },
                },
                content: {
                    required: true,
                    spec: {
                        type: 'oneOf',
                        union: [
                            {
                                type: 'string',
                            },
                            {
                                type: 'array',
                                minItems: 1,
                                items: {
                                    type: 'ref',
                                    ref: 'ChatCompletionRequestMessageContentPartText',
                                },
                            },
                        ],
                    },
                },
            },
            additionalProperties: false,
        },
    },
    ChatCompletionStreamOptions: {
        type: 'anyOf',
        union: [
            {
                type: 'object',
                object: {
                    properties: {
                        include_usage: {
                            required: false,
                            spec: {
                                type: 'boolean',
                            },
                        },
                        include_obfuscation: {
                            required: false,
                            spec: {
                                type: 'boolean',
                            },
                        },
                    },
                    additionalProperties: false,
                },
            },
            {
                type: 'null',
            },
        ],
    },
    ChatCompletionTool: {
        type: 'object',
        object: {
            properties: {
                type: {
                    required: true,
                    spec: {
                        type: 'string',
                        enum: ['function'],
                    },
                },
                function: {
                    required: true,
                    spec: {
                        type: 'ref',
                        ref: 'FunctionObject',
                    },
                },
            },
            additionalProperties: false,
        },
    },
    CustomToolChatCompletions: {
        type: 'object',
        object: {
            properties: {
                type: {
                    required: true,
                    spec: {
                        type: 'string',
                        enum: ['custom'],
                    },
                },
                custom: {
                    required: true,
                    spec: {
                        type: 'object',
                        object: {
                            properties: {
                                name: {
                                    required: true,
                                    spec: {
                                        type: 'string',
                                    },
                                },
                                description: {
                                    required: false,
                                    spec: {
                                        type: 'string',
                                    },
                                },
                                format: {
                                    required: false,
                                    spec: {
                                        type: 'oneOf',
                                        union: [
                                            {
                                                type: 'object',
                                                object: {
                                                    properties: {
                                                        type: {
                                                            required: true,
                                                            spec: {
                                                                type: 'string',
                                                                enum: ['text'],
                                                            },
                                                        },
                                                    },
                                                    additionalProperties: false,
                                                },
                                            },
                                            {
                                                type: 'object',
                                                object: {
                                                    properties: {
                                                        type: {
                                                            required: true,
                                                            spec: {
                                                                type: 'string',
                                                                enum: ['grammar'],
                                                            },
                                                        },
                                                        grammar: {
                                                            required: true,
                                                            spec: {
                                                                type: 'object',
                                                                object: {
                                                                    properties: {
                                                                        definition: {
                                                                            required: true,
                                                                            spec: {
                                                                                type: 'string',
                                                                            },
                                                                        },
                                                                        syntax: {
                                                                            required: true,
                                                                            spec: {
                                                                                type: 'string',
                                                                                enum: ['lark', 'regex'],
                                                                            },
                                                                        },
                                                                    },
                                                                    additionalProperties: false,
                                                                },
                                                            },
                                                        },
                                                    },
                                                    additionalProperties: false,
                                                },
                                            },
                                        ],
                                    },
                                },
                            },
                            additionalProperties: false,
                        },
                    },
                },
            },
            additionalProperties: false,
        },
    },
    ChatCompletionToolChoiceOption: {
        type: 'oneOf',
        union: [
            {
                type: 'string',
                enum: ['none', 'auto', 'required'],
            },
            {
                type: 'ref',
                ref: 'ChatCompletionAllowedToolsChoice',
            },
            {
                type: 'ref',
                ref: 'ChatCompletionNamedToolChoice',
            },
            {
                type: 'ref',
                ref: 'ChatCompletionNamedToolChoiceCustom',
            },
        ],
    },
    ParallelToolCalls: {
        type: 'boolean',
    },
    ChatCompletionFunctionCallOption: {
        type: 'object',
        object: {
            properties: {
                name: {
                    required: true,
                    spec: {
                        type: 'string',
                    },
                },
            },
            additionalProperties: false,
        },
    },
    ChatCompletionFunctions: {
        type: 'object',
        object: {
            properties: {
                description: {
                    required: false,
                    spec: {
                        type: 'string',
                    },
                },
                name: {
                    required: true,
                    spec: {
                        type: 'string',
                    },
                },
                parameters: {
                    required: false,
                    spec: {
                        type: 'ref',
                        ref: 'FunctionParameters',
                    },
                },
            },
            additionalProperties: false,
        },
    },
    ResponseFormatJsonSchemaSchema: {
        type: 'object',
        object: {
            properties: {},
            additionalProperties: true,
        },
    },
    ChatCompletionRequestMessageContentPartText: {
        type: 'object',
        object: {
            properties: {
                type: {
                    required: true,
                    spec: {
                        type: 'string',
                        enum: ['text'],
                    },
                },
                text: {
                    required: true,
                    spec: {
                        type: 'string',
                    },
                },
            },
            additionalProperties: false,
        },
    },
    ChatCompletionRequestSystemMessageContentPart: {
        type: 'oneOf',
        union: [
            {
                type: 'ref',
                ref: 'ChatCompletionRequestMessageContentPartText',
            },
        ],
    },
    ChatCompletionRequestUserMessageContentPart: {
        type: 'oneOf',
        union: [
            {
                type: 'ref',
                ref: 'ChatCompletionRequestMessageContentPartText',
            },
            {
                type: 'ref',
                ref: 'ChatCompletionRequestMessageContentPartImage',
            },
            {
                type: 'ref',
                ref: 'ChatCompletionRequestMessageContentPartAudio',
            },
            {
                type: 'ref',
                ref: 'ChatCompletionRequestMessageContentPartFile',
            },
        ],
    },
    ChatCompletionRequestAssistantMessageContentPart: {
        type: 'oneOf',
        union: [
            {
                type: 'ref',
                ref: 'ChatCompletionRequestMessageContentPartText',
            },
            {
                type: 'ref',
                ref: 'ChatCompletionRequestMessageContentPartRefusal',
            },
        ],
    },
    ChatCompletionMessageToolCalls: {
        type: 'array',
        items: {
            type: 'oneOf',
            union: [
                {
                    type: 'ref',
                    ref: 'ChatCompletionMessageToolCall',
                },
                {
                    type: 'ref',
                    ref: 'ChatCompletionMessageCustomToolCall',
                },
            ],
        },
    },
    ChatCompletionRequestToolMessageContentPart: {
        type: 'oneOf',
        union: [
            {
                type: 'ref',
                ref: 'ChatCompletionRequestMessageContentPartText',
            },
        ],
    },
    ModelResponseProperties: {
        type: 'object',
        object: {
            properties: {
                metadata: {
                    required: false,
                    spec: {
                        type: 'ref',
                        ref: 'Metadata',
                    },
                },
                top_logprobs: {
                    required: false,
                    spec: {
                        type: 'anyOf',
                        union: [
                            {
                                type: 'integer',
                                maximum: 20,
                            },
                            {
                                type: 'null',
                            },
                        ],
                    },
                },
                temperature: {
                    required: false,
                    spec: {
                        type: 'anyOf',
                        union: [
                            {
                                type: 'float',
                                maximum: 2,
                            },
                            {
                                type: 'null',
                            },
                        ],
                    },
                },
                top_p: {
                    required: false,
                    spec: {
                        type: 'anyOf',
                        union: [
                            {
                                type: 'float',
                                maximum: 1,
                            },
                            {
                                type: 'null',
                            },
                        ],
                    },
                },
                user: {
                    required: false,
                    spec: {
                        type: 'string',
                    },
                },
                safety_identifier: {
                    required: false,
                    spec: {
                        type: 'string',
                    },
                },
                prompt_cache_key: {
                    required: false,
                    spec: {
                        type: 'string',
                    },
                },
                service_tier: {
                    required: false,
                    spec: {
                        type: 'ref',
                        ref: 'ServiceTier',
                    },
                },
                prompt_cache_retention: {
                    required: false,
                    spec: {
                        type: 'anyOf',
                        union: [
                            {
                                type: 'string',
                                enum: ['in_memory', '24h'],
                            },
                            {
                                type: 'null',
                            },
                        ],
                    },
                },
            },
            additionalProperties: false,
        },
    },
    FunctionObject: {
        type: 'object',
        object: {
            properties: {
                description: {
                    required: false,
                    spec: {
                        type: 'string',
                    },
                },
                name: {
                    required: true,
                    spec: {
                        type: 'string',
                    },
                },
                parameters: {
                    required: false,
                    spec: {
                        type: 'ref',
                        ref: 'FunctionParameters',
                    },
                },
                strict: {
                    required: false,
                    spec: {
                        type: 'anyOf',
                        union: [
                            {
                                type: 'boolean',
                            },
                            {
                                type: 'null',
                            },
                        ],
                    },
                },
            },
            additionalProperties: false,
        },
    },
    ChatCompletionAllowedToolsChoice: {
        type: 'object',
        object: {
            properties: {
                type: {
                    required: true,
                    spec: {
                        type: 'string',
                        enum: ['allowed_tools'],
                    },
                },
                allowed_tools: {
                    required: true,
                    spec: {
                        type: 'ref',
                        ref: 'ChatCompletionAllowedTools',
                    },
                },
            },
            additionalProperties: false,
        },
    },
    ChatCompletionNamedToolChoice: {
        type: 'object',
        object: {
            properties: {
                type: {
                    required: true,
                    spec: {
                        type: 'string',
                        enum: ['function'],
                    },
                },
                function: {
                    required: true,
                    spec: {
                        type: 'object',
                        object: {
                            properties: {
                                name: {
                                    required: true,
                                    spec: {
                                        type: 'string',
                                    },
                                },
                            },
                            additionalProperties: false,
                        },
                    },
                },
            },
            additionalProperties: false,
        },
    },
    ChatCompletionNamedToolChoiceCustom: {
        type: 'object',
        object: {
            properties: {
                type: {
                    required: true,
                    spec: {
                        type: 'string',
                        enum: ['custom'],
                    },
                },
                custom: {
                    required: true,
                    spec: {
                        type: 'object',
                        object: {
                            properties: {
                                name: {
                                    required: true,
                                    spec: {
                                        type: 'string',
                                    },
                                },
                            },
                            additionalProperties: false,
                        },
                    },
                },
            },
            additionalProperties: false,
        },
    },
    FunctionParameters: {
        type: 'object',
        object: {
            properties: {},
            additionalProperties: true,
        },
    },
    ChatCompletionRequestMessageContentPartImage: {
        type: 'object',
        object: {
            properties: {
                type: {
                    required: true,
                    spec: {
                        type: 'string',
                        enum: ['image_url'],
                    },
                },
                image_url: {
                    required: true,
                    spec: {
                        type: 'object',
                        object: {
                            properties: {
                                url: {
                                    required: true,
                                    spec: {
                                        type: 'string',
                                    },
                                },
                                detail: {
                                    required: false,
                                    spec: {
                                        type: 'string',
                                        enum: ['auto', 'low', 'high'],
                                    },
                                },
                            },
                            additionalProperties: false,
                        },
                    },
                },
            },
            additionalProperties: false,
        },
    },
    ChatCompletionRequestMessageContentPartAudio: {
        type: 'object',
        object: {
            properties: {
                type: {
                    required: true,
                    spec: {
                        type: 'string',
                        enum: ['input_audio'],
                    },
                },
                input_audio: {
                    required: true,
                    spec: {
                        type: 'object',
                        object: {
                            properties: {
                                data: {
                                    required: true,
                                    spec: {
                                        type: 'string',
                                    },
                                },
                                format: {
                                    required: true,
                                    spec: {
                                        type: 'string',
                                        enum: ['wav', 'mp3'],
                                    },
                                },
                            },
                            additionalProperties: false,
                        },
                    },
                },
            },
            additionalProperties: false,
        },
    },
    ChatCompletionRequestMessageContentPartFile: {
        type: 'object',
        object: {
            properties: {
                type: {
                    required: true,
                    spec: {
                        type: 'string',
                        enum: ['file'],
                    },
                },
                file: {
                    required: true,
                    spec: {
                        type: 'object',
                        object: {
                            properties: {
                                filename: {
                                    required: false,
                                    spec: {
                                        type: 'string',
                                    },
                                },
                                file_data: {
                                    required: false,
                                    spec: {
                                        type: 'string',
                                    },
                                },
                                file_id: {
                                    required: false,
                                    spec: {
                                        type: 'string',
                                    },
                                },
                            },
                            additionalProperties: false,
                        },
                    },
                },
            },
            additionalProperties: false,
        },
    },
    ChatCompletionRequestMessageContentPartRefusal: {
        type: 'object',
        object: {
            properties: {
                type: {
                    required: true,
                    spec: {
                        type: 'string',
                        enum: ['refusal'],
                    },
                },
                refusal: {
                    required: true,
                    spec: {
                        type: 'string',
                    },
                },
            },
            additionalProperties: false,
        },
    },
    ChatCompletionMessageToolCall: {
        type: 'object',
        object: {
            properties: {
                id: {
                    required: true,
                    spec: {
                        type: 'string',
                    },
                },
                type: {
                    required: true,
                    spec: {
                        type: 'string',
                        enum: ['function'],
                    },
                },
                function: {
                    required: true,
                    spec: {
                        type: 'object',
                        object: {
                            properties: {
                                name: {
                                    required: true,
                                    spec: {
                                        type: 'string',
                                    },
                                },
                                arguments: {
                                    required: true,
                                    spec: {
                                        type: 'string',
                                    },
                                },
                            },
                            additionalProperties: false,
                        },
                    },
                },
            },
            additionalProperties: false,
        },
    },
    ChatCompletionMessageCustomToolCall: {
        type: 'object',
        object: {
            properties: {
                id: {
                    required: true,
                    spec: {
                        type: 'string',
                    },
                },
                type: {
                    required: true,
                    spec: {
                        type: 'string',
                        enum: ['custom'],
                    },
                },
                custom: {
                    required: true,
                    spec: {
                        type: 'object',
                        object: {
                            properties: {
                                name: {
                                    required: true,
                                    spec: {
                                        type: 'string',
                                    },
                                },
                                input: {
                                    required: true,
                                    spec: {
                                        type: 'string',
                                    },
                                },
                            },
                            additionalProperties: false,
                        },
                    },
                },
            },
            additionalProperties: false,
        },
    },
    Metadata: {
        type: 'anyOf',
        union: [
            {
                type: 'object',
                object: {
                    properties: {},
                    additionalProperties: 'string',
                },
            },
            {
                type: 'null',
            },
        ],
    },
    ChatCompletionAllowedTools: {
        type: 'object',
        object: {
            properties: {
                mode: {
                    required: true,
                    spec: {
                        type: 'string',
                        enum: ['auto', 'required'],
                    },
                },
                tools: {
                    required: true,
                    spec: {
                        type: 'array',
                        items: {
                            type: 'object',
                            object: {
                                properties: {},
                                additionalProperties: true,
                            },
                        },
                    },
                },
            },
            additionalProperties: false,
        },
    },
};
const objectShapes = new WeakMap();
function validationError(path, message) {
    return [path ? `${path} ${message}` : 'error'];
}
function checkNamed(name, o, path) {
    const spec = validationSpecs[name];
    if (!spec) {
        return validationError(path, `has unknown schema ${name}`);
    }
    return checkSpec(spec, o, path);
}
function checkSpec(spec, o, path) {
    if (spec.nullable && o === null) {
        return [];
    }
    switch (spec.type) {
        case 'anyOf':
        case 'oneOf':
            return checkUnion(spec, o, path);
        case 'array': {
            if (!Array.isArray(o)) {
                return validationError(path, 'must be an array');
            }
            if (spec.minItems !== undefined && o.length < spec.minItems) {
                return validationError(path, `must contain at least ${spec.minItems} item${spec.minItems === 1 ? '' : 's'}`);
            }
            if (!spec.items) {
                return [];
            }
            const result = [];
            for (let i = 0; i < o.length; i++) {
                const errors = checkSpec(spec.items, o[i], path ? `${path}[${i}]` : undefined);
                result.push(...errors);
                if (!path && errors.length) {
                    break;
                }
            }
            return result;
        }
        case 'boolean':
            return typeof o === 'boolean'
                ? []
                : validationError(path, 'must be a boolean');
        case 'integer':
        case 'float': {
            if (typeof o !== 'number' || !Number.isFinite(o)) {
                return validationError(path, 'must be a number');
            }
            if (spec.type === 'integer' && !Number.isInteger(o)) {
                return validationError(path, 'must be an integer');
            }
            if (spec.minimum !== undefined && o < spec.minimum) {
                return validationError(path, `must be at least ${spec.minimum}`);
            }
            if (spec.maximum !== undefined && o > spec.maximum) {
                return validationError(path, `must be at most ${spec.maximum}`);
            }
            return [];
        }
        case 'null':
            return o === null ? [] : validationError(path, 'must be null');
        case 'object':
            return checkObject(spec, o, path);
        case 'ref':
            return spec.ref
                ? checkNamed(spec.ref, o, path)
                : validationError(path, 'has a reference without a schema name');
        case 'string': {
            if (typeof o !== 'string') {
                return validationError(path, 'must be a string');
            }
            if (spec.enum && !spec.enum.includes(o)) {
                return validationError(path, `must be one of ${spec.enum.map((value) => JSON.stringify(value)).join(', ')}`);
            }
            if (spec.pattern && !new RegExp(spec.pattern).test(o)) {
                return validationError(path, `must match /${spec.pattern}/`);
            }
            return [];
        }
        default:
            return validationError(path, `has unsupported schema type ${spec.type}`);
    }
}
function checkUnion(spec, o, path) {
    const alternatives = spec.union ?? [];
    const results = alternatives.map((alternative) => checkSpec(alternative, o, path));
    const matches = results.filter((errors) => errors.length === 0).length;
    if (spec.type === 'anyOf' ? matches > 0 : matches === 1) {
        return [];
    }
    if (matches > 1) {
        return validationError(path, 'must match exactly one allowed schema');
    }
    if (path && results.length) {
        return results.reduce((best, errors) => errors.length < best.length ? errors : best);
    }
    return validationError(path, 'does not match an allowed schema');
}
function getObjectShape(spec) {
    const cached = objectShapes.get(spec);
    if (cached) {
        return cached;
    }
    let properties = {};
    let additionalProperties = false;
    if (spec.extends) {
        const base = validationSpecs[spec.extends];
        if (base?.type === 'object') {
            const baseShape = getObjectShape(base);
            properties = { ...baseShape.properties };
            additionalProperties = baseShape.additionalProperties;
        }
    }
    properties = {
        ...properties,
        ...(spec.object?.properties ?? {}),
    };
    if (spec.object?.additionalProperties !== undefined) {
        additionalProperties = spec.object.additionalProperties;
    }
    const result = { properties, additionalProperties };
    objectShapes.set(spec, result);
    return result;
}
function checkObject(spec, o, path) {
    if (typeof o !== 'object' || o === null || Array.isArray(o)) {
        return validationError(path, 'must be an object');
    }
    const result = [];
    const shape = getObjectShape(spec);
    for (const [name, property] of Object.entries(shape.properties)) {
        const propertyPath = path ? `${path}.${name}` : undefined;
        const value = o[name];
        if (value === undefined) {
            if (property.required) {
                const errors = validationError(propertyPath, 'is required');
                result.push(...errors);
                if (!path) {
                    return result;
                }
            }
            continue;
        }
        const errors = checkSpec(property.spec, value, propertyPath);
        result.push(...errors);
        if (!path && errors.length) {
            return result;
        }
    }
    for (const name of Object.keys(o)) {
        if (Object.hasOwn(shape.properties, name)) {
            continue;
        }
        const propertyPath = path ? `${path}.${name}` : undefined;
        if (shape.additionalProperties === false) {
            const errors = validationError(propertyPath, 'is not allowed');
            result.push(...errors);
            if (!path) {
                return result;
            }
        }
        else if (typeof shape.additionalProperties === 'string') {
            const errors = checkSpec({ type: shape.additionalProperties }, o[name], propertyPath);
            result.push(...errors);
            if (!path && errors.length) {
                return result;
            }
        }
    }
    return result;
}
//# sourceMappingURL=openai-types.js.map