import { useChatStore } from "../../store/chatStore";
import { NewChatForm } from "../NewChatForm/NewChatForm";
import styles from "./ChatSidebar.module.css";
import { ChatSidebarHeader } from "./ChatSidebarHeader";

const CONNECTION_PRESENTATION = {
    connecting: {
        text: "Подключение...",
        className: styles.connection,
    },
    online: {
        text: "Получение сообщений включено",
        className: `${styles.connection} ${styles.connectionOnline}`,
    },
    reconnecting: {
        text: "Переподключение...",
        className: styles.connection,
    },
} as const;

export function ChatSidebar() {
    const chats = useChatStore(state => state.chats);
    const activeChatId = useChatStore(state => state.activeChatId);
    const isNewChatOpen = useChatStore(state => state.isNewChatOpen);
    const connection = useChatStore(state => state.connection);
    const connectionError = useChatStore(state => state.connectionError);
    const createChat = useChatStore(state => state.createChat);
    const selectChat = useChatStore(state => state.selectChat);
    const closeNewChat = useChatStore(state => state.closeNewChat);
    const connectionPresentation = CONNECTION_PRESENTATION[connection];

    const connectionErrorMessage = connectionError && (
        <p className={styles.connectionError}>{connectionError}</p>
    );
    const newChatForm = isNewChatOpen && (
        <NewChatForm onCreate={createChat} onCancel={closeNewChat} />
    );

    return (
        <aside className={styles.sidebar}>
            <ChatSidebarHeader />

            <p className={connectionPresentation.className}>
                {connectionPresentation.text}
            </p>

            {connectionErrorMessage}
            {newChatForm}

            <div className={styles.list}>
                {chats.length === 0 ? (
                    <p className={styles.empty}>Чатов пока нет</p>
                ) : (
                    chats.map(chat => (
                        <button
                            type="button"
                            key={chat.chatId}
                            className={
                                chat.chatId === activeChatId
                                    ? styles.activeChat
                                    : styles.chat
                            }
                            onClick={() => selectChat(chat.chatId)}
                        >
                            <span>{chat.title}</span>
                            {chat.unreadCount > 0 && (
                                <small>{chat.unreadCount}</small>
                            )}
                        </button>
                    ))
                )}
            </div>
        </aside>
    );
}
