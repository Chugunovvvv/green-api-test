import { ChatSidebar } from "../ChatSidebar/ChatSidebar";
import { Conversation } from "../Conversation/Conversation";
import { useChatStore } from "../../store/chatStore";
import styles from "./ChatPage.module.css";

export function ChatPage() {
    const hasActiveChat = useChatStore(state => state.activeChatId !== null);

    return (
        <main className={styles.page} data-chat-open={hasActiveChat}>
            <ChatSidebar />
            <Conversation />
        </main>
    );
}
