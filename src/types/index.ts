export type Credentials = {
    idInstance: string;
    apiTokenInstance: string;
};

export type MessageStatus = "sending" | "sent" | "failed" | "received";

export type Message = {
    id: string;
    text: string;
    direction: "incoming" | "outgoing";
    timestamp: number;
    status: MessageStatus;
};

export type Chat = {
    chatId: string;
    correspondent: string;
    title: string;
    messages: Message[];
    unreadCount: number;
};

export type IncomingMessage = {
    chatId: string;
    correspondent: string;
    title: string;
    message: Message;
};

export type GreenApiNotification = {
    receiptId: number;
    body: {
        typeWebhook?: string;
        timestamp?: number;
        idMessage?: string;
        senderData?: {
            chatId?: string;
            chatName?: string;
            senderName?: string;
            senderPhoneNumber?: number;
        };
        messageData?: {
            typeMessage?: string;
            textMessageData?: {
                textMessage?: string;
            };
            extendedTextMessageData?: {
                text?: string;
            };
        };
    };
};
