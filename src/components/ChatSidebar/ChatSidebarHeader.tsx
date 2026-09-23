import { useChatStore } from "../../store/chatStore";
import styles from "./ChatSidebar.module.css";

export function ChatSidebarHeader() {
    const openNewChat = useChatStore(state => state.openNewChat);
    const disconnect = useChatStore(state => state.disconnect);

    return (
        <header className={styles.header}>
            <strong>Telegram Chat</strong>
            <div>
                <button type="button" onClick={openNewChat}>
                    Новый чат
                </button>
                <button type="button" onClick={disconnect}>
                    Выйти
                </button>
            </div>
        </header>
    );
}
