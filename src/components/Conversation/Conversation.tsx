import { useChatStore } from "../../store/chatStore";
import { MessageComposer } from "../MessageComposer/MessageComposer";
import { MessageList } from "../MessageList/MessageList";
import { ConservationHeader } from "./ConservationHeader";
import styles from "./Conversation.module.css";

export function Conversation() {
    const chat = useChatStore(
        state =>
            state.chats.find(
                currentChat => currentChat.chatId === state.activeChatId
            ) ?? null
    );
    const connectionError = useChatStore(state => state.connectionError);
    const sendMessage = useChatStore(state => state.sendMessage);

    if (!chat) {
        return (
            <section className={styles.placeholder}>
                Выберите чат или создайте новый
            </section>
        );
    }

    const connectedError = connectionError && (
        <p className={styles.connectionError}>{connectionError}</p>
    );

    return (
        <section className={styles.conversation}>
            <ConservationHeader title={chat.title} />

            {connectedError}
            <MessageList messages={chat.messages} />
            <MessageComposer
                key={chat.chatId}
                onSend={message => sendMessage(chat.chatId, message)}
            />
        </section>
    );
}
