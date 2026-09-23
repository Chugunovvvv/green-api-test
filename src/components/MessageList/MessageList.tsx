import type { Message } from "../../types";
import styles from "./MessageList.module.css";
import { formatTime } from "../../utils";

type Props = {
    messages: Message[];
};

export function MessageList({ messages }: Props) {
    if (messages.length === 0) {
        return <div className={styles.empty}>Сообщений пока нет</div>;
    }

    return (
        <div className={styles.list}>
            {messages.map(message => (
                <div
                    key={message.id}
                    className={
                        message.direction === "outgoing"
                            ? styles.outgoing
                            : styles.incoming
                    }
                >
                    <p>{message.text}</p>
                    <small>
                        {formatTime(message.timestamp)} · {message.status}
                    </small>
                </div>
            ))}
        </div>
    );
}
