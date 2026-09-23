import type { GreenApiNotification, IncomingMessage } from "../types";

export function mapIncomingMessage(
    notification: GreenApiNotification
): IncomingMessage | null {
    const { body } = notification;

    if (body.typeWebhook !== "incomingMessageReceived") {
        return null;
    }

    const messageData = body.messageData;
    const chatId = body.senderData?.chatId;

    const text = (() => {
        switch (messageData?.typeMessage) {
            case "textMessage":
                return messageData.textMessageData?.textMessage;
            case "extendedTextMessage":
                return messageData.extendedTextMessageData?.text;
            default:
                return undefined;
        }
    })();

    if (!chatId || !text) {
        return null;
    }

    const senderPhoneNumber = body.senderData?.senderPhoneNumber;
    const correspondent =
        senderPhoneNumber && senderPhoneNumber > 0
            ? String(senderPhoneNumber)
            : chatId;

    return {
        chatId,
        correspondent,
        title:
            body.senderData?.chatName ||
            body.senderData?.senderName ||
            correspondent ||
            "Новый чат",
        message: {
            id: body.idMessage ?? crypto.randomUUID(),
            text,
            direction: "incoming",
            timestamp: (body.timestamp ?? Math.floor(Date.now() / 1000)) * 1000,
            status: "received",
        },
    };
}
