import { useChatStore } from "../../store/chatStore";
import styles from "./Conversation.module.css";

export function ConservationHeader({ title }: { title: string }) {
    const closeActiveChat = useChatStore(state => state.closeActiveChat);
    return (
        <header>
            <button
                className={styles.mobileBack}
                type="button"
                onClick={closeActiveChat}
                aria-label="Вернуться к списку чатов"
            >
                ←
            </button>
            <span>{title}</span>
        </header>
    );
}
