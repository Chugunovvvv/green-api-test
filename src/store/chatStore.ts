import { create } from "zustand";
import { GreenApiClient } from "../api/greenApiClient";
import { NotificationPollingService } from "../services/NotificationPollingService";
import type { Chat, Credentials, IncomingMessage, Message } from "../types";
import { formatCorrespondent } from "../utils/correspondent";

type ConnectionState = "ready" | "online" | "reconnecting";

type OpenedChat = Chat & {
    receiveMessagesFrom: number;
};

type ChatStore = {
    credentials: Credentials | null;
    chats: OpenedChat[];
    activeChatId: string | null;
    isNewChatOpen: boolean;
    connection: ConnectionState;
    connectionError: string | null;
    connect: (credentials: Credentials) => Promise<void>;
    disconnect: () => void;
    createChat: (correspondent: string) => Promise<void>;
    selectChat: (chatId: string) => void;
    closeActiveChat: () => void;
    openNewChat: () => void;
    closeNewChat: () => void;
    sendMessage: (chatId: string, text: string) => Promise<void>;
};

const initialSessionState = {
    credentials: null,
    chats: [],
    activeChatId: null,
    isNewChatOpen: false,
    connection: "ready" as const,
    connectionError: null,
};

let apiClient: GreenApiClient | null = null;
let pollingService: NotificationPollingService | null = null;
let connectionAttempt = 0;
let sessionVersion = 0;

function updateChat(
    chats: OpenedChat[],
    chatId: string,
    updater: (chat: OpenedChat) => OpenedChat
): OpenedChat[] {
    return chats.map(chat => (chat.chatId === chatId ? updater(chat) : chat));
}

function addIncomingMessage(
    state: ChatStore,
    payload: IncomingMessage
): Pick<ChatStore, "chats"> | ChatStore {
    const existingChat = state.chats.find(
        chat => chat.chatId === payload.chatId
    );

    if (
        !existingChat ||
        payload.message.timestamp < existingChat.receiveMessagesFrom ||
        existingChat.messages.some(message => message.id === payload.message.id)
    ) {
        return state;
    }

    return {
        chats: updateChat(state.chats, payload.chatId, chat => ({
            ...chat,
            title: payload.title || chat.title,
            messages: [...chat.messages, payload.message],
            unreadCount:
                state.activeChatId === payload.chatId
                    ? 0
                    : chat.unreadCount + 1,
        })),
    };
}

export const useChatStore = create<ChatStore>((set, get) => ({
    ...initialSessionState,

    connect: async credentials => {
        const attempt = ++connectionAttempt;
        const client = new GreenApiClient(credentials);

        await client.validateConnection();

        if (attempt !== connectionAttempt) {
            return;
        }

        pollingService?.stop();
        apiClient = client;
        const currentSession = ++sessionVersion;

        set({
            ...initialSessionState,
            credentials,
            connection: "ready",
        });

        pollingService = new NotificationPollingService(client, {
            onMessage: message => {
                if (currentSession === sessionVersion) {
                    set(state => addIncomingMessage(state, message));
                }
            },
            onStateChange: (connection, error) => {
                if (currentSession === sessionVersion) {
                    set({
                        connection,
                        connectionError: error ?? null,
                    });
                }
            },
        });
    },

    disconnect: () => {
        connectionAttempt += 1;
        sessionVersion += 1;
        pollingService?.stop();
        pollingService = null;
        apiClient = null;
        set(initialSessionState);
    },

    createChat: async correspondent => {
        const existingChat = get().chats.find(
            chat => chat.correspondent === correspondent
        );

        if (existingChat) {
            get().selectChat(existingChat.chatId);
            return;
        }

        const client = apiClient;
        const currentSession = sessionVersion;

        if (!client) {
            throw new Error("Сессия GREEN-API не активна");
        }

        const chatId = await client.checkAccount(correspondent);

        if (currentSession !== sessionVersion) {
            return;
        }

        set(state => {
            const chatAlreadyExists = state.chats.some(
                chat => chat.chatId === chatId
            );
            const chat: OpenedChat = {
                chatId,
                correspondent,
                title: formatCorrespondent(correspondent),
                messages: [],
                unreadCount: 0,
                receiveMessagesFrom: Math.floor(Date.now() / 1_000) * 1_000,
            };

            return {
                chats: chatAlreadyExists ? state.chats : [chat, ...state.chats],
                activeChatId: chatId,
                isNewChatOpen: false,
                connection: "online",
                connectionError: null,
            };
        });

        pollingService?.start();
    },

    selectChat: chatId => {
        set(state => ({
            activeChatId: chatId,
            isNewChatOpen: false,
            chats: updateChat(state.chats, chatId, chat => ({
                ...chat,
                unreadCount: 0,
            })),
        }));
    },

    closeActiveChat: () => set({ activeChatId: null }),
    openNewChat: () => set({ isNewChatOpen: true }),
    closeNewChat: () => set({ isNewChatOpen: false }),

    sendMessage: async (chatId, text) => {
        const client = apiClient;
        const currentSession = sessionVersion;

        if (!client) {
            throw new Error("Сессия GREEN-API не активна");
        }

        const temporaryId = crypto.randomUUID();
        const message: Message = {
            id: temporaryId,
            text,
            direction: "outgoing",
            timestamp: Date.now(),
            status: "sending",
        };

        set(state => ({
            chats: updateChat(state.chats, chatId, chat => ({
                ...chat,
                messages: [...chat.messages, message],
            })),
        }));

        try {
            const messageId = await client.sendMessage(chatId, text);

            if (currentSession !== sessionVersion) {
                return;
            }

            set(state => ({
                chats: updateChat(state.chats, chatId, chat => ({
                    ...chat,
                    messages: chat.messages.map(currentMessage =>
                        currentMessage.id === temporaryId
                            ? {
                                  ...currentMessage,
                                  id: messageId,
                                  status: "sent" as const,
                              }
                            : currentMessage
                    ),
                })),
            }));
        } catch (error) {
            if (currentSession === sessionVersion) {
                set(state => ({
                    chats: updateChat(state.chats, chatId, chat => ({
                        ...chat,
                        messages: chat.messages.map(currentMessage =>
                            currentMessage.id === temporaryId
                                ? {
                                      ...currentMessage,
                                      status: "failed" as const,
                                  }
                                : currentMessage
                        ),
                    })),
                }));
            }

            throw error;
        }
    },
}));
