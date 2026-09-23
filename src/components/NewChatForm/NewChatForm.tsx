import { useActionState, useState } from "react";
import {
    isSupportedCorrespondent,
    normalizeCorrespondent,
} from "../../utils/correspondent";
import styles from "./NewChatForm.module.css";

type State = {
    error: string | null;
    submittedCorrespondent: string | null;
};

const initialState: State = {
    error: null,
    submittedCorrespondent: null,
};

type Props = {
    onCreate: (correspondent: string) => Promise<void>;
    onCancel: () => void;
};

export function NewChatForm({ onCreate, onCancel }: Props) {
    const [correspondent, setCorrespondent] = useState("");
    const [state, submitAction, isPending] = useActionState<State, FormData>(
        async (_previousState, formData) => {
            const submittedCorrespondent = String(
                formData.get("correspondent") ?? "",
            );

            if (!isSupportedCorrespondent(submittedCorrespondent)) {
                return {
                    error: "Введите международный номер или @username",
                    submittedCorrespondent,
                };
            }

            try {
                await onCreate(normalizeCorrespondent(submittedCorrespondent));
                return { error: null, submittedCorrespondent };
            } catch (error) {
                return {
                    error:
                        error instanceof Error
                            ? error.message
                            : "Не удалось создать чат",
                    submittedCorrespondent,
                };
            }
        },
        initialState,
    );

    const error =
        state.submittedCorrespondent === correspondent ? state.error : null;

    return (
        <form className={styles.form} action={submitAction}>
            <label>
                Номер телефона или @username
                <input
                    autoFocus
                    name="correspondent"
                    value={correspondent}
                    onChange={(event) => setCorrespondent(event.target.value)}
                    placeholder="+7 999 123-45-67 или @username"
                    autoCapitalize="none"
                    autoCorrect="off"
                />
            </label>

            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.actions}>
                <button type="button" onClick={onCancel}>
                    Отмена
                </button>
                <button type="submit" disabled={isPending}>
                    {isPending ? "Проверка..." : "Создать"}
                </button>
            </div>
        </form>
    );
}
