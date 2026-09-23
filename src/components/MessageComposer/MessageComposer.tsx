import { useActionState, useState } from "react";
import styles from "./MessageComposer.module.css";

type ComposerState = {
    error: string | null;
    submittedText: string | null;
};

const initialState: ComposerState = {
    error: null,
    submittedText: null,
};

type Props = {
    onSend: (message: string) => Promise<void>;
};

export function MessageComposer({ onSend }: Props) {
    const [value, setValue] = useState("");
    const [state, submitAction, isPending] = useActionState<
        ComposerState,
        FormData
    >(async (_previousState, formData) => {
        const text = String(formData.get("message") ?? "").trim();

        if (!text) {
            return { error: null, submittedText: null };
        }

        try {
            await onSend(text);
            setValue(currentValue =>
                currentValue.trim() === text ? "" : currentValue
            );
            return { error: null, submittedText: text };
        } catch (error) {
            return {
                error:
                    error instanceof Error
                        ? error.message
                        : "Сообщение не отправлено",
                submittedText: text,
            };
        }
    }, initialState);

    const error = state.submittedText === value.trim() ? state.error : null;

    return (
        <form className={styles.form} action={submitAction}>
            {error && <p>{error}</p>}
            <div>
                <textarea
                    maxLength={4096}
                    name="message"
                    value={value}
                    onChange={event => setValue(event.target.value)}
                    placeholder="Введите сообщение"
                />
                <button type="submit" disabled={!value.trim() || isPending}>
                    {isPending ? "Отправка..." : "Отправить"}
                </button>
            </div>
        </form>
    );
}
