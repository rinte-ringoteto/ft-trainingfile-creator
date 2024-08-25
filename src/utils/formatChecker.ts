interface FormatErrors {
    [key: string]: number;
}

export const checkFormat = (jsonlData: string): FormatErrors => {
    const formatErrors: FormatErrors = {};
    const dataset = jsonlData.split('\n').map(line => JSON.parse(line));

    for (const ex of dataset) {
        if (typeof ex !== 'object' || ex === null) {
            formatErrors["data_type"] = (formatErrors["data_type"] || 0) + 1;
            continue;
        }

        const messages = ex.messages;
        if (!messages || !Array.isArray(messages)) {
            formatErrors["missing_messages_list"] = (formatErrors["missing_messages_list"] || 0) + 1;
            continue;
        }

        for (const message of messages) {
            if (!message.role || !message.content) {
                formatErrors["message_missing_key"] = (formatErrors["message_missing_key"] || 0) + 1;
            }

            if (Object.keys(message).some(k => !["role", "content", "name", "function_call", "weight"].includes(k))) {
                formatErrors["message_unrecognized_key"] = (formatErrors["message_unrecognized_key"] || 0) + 1;
            }

            if (!["system", "user", "assistant", "function"].includes(message.role)) {
                formatErrors["unrecognized_role"] = (formatErrors["unrecognized_role"] || 0) + 1;
            }

            if (!message.content || typeof message.content !== 'string') {
                formatErrors["missing_content"] = (formatErrors["missing_content"] || 0) + 1;
            }
        }

        if (!messages.some(message => message.role === "assistant")) {
            formatErrors["example_missing_assistant_message"] = (formatErrors["example_missing_assistant_message"] || 0) + 1;
        }
    }

    return formatErrors;
};