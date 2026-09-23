import { useActionState, useState } from "react";
import { useChatStore } from "../../store/chatStore";
import type { Credentials } from "../../types";
import styles from "./CredentialsForm.module.css";

type FormState = {
    error: string | null;
    submittedCredentials: Credentials | null;
};

const initialState: FormState = {
    error: null,
    submittedCredentials: null,
};

export function CredentialsForm() {
    const [idInstance, setIdInstance] = useState("");
    const [apiTokenInstance, setApiTokenInstance] = useState("");
    const connect = useChatStore(state => state.connect);
    const [formState, submitAction, isPending] = useActionState<
        FormState,
        FormData
    >(async (_previousState, formData) => {
        const credentials: Credentials = {
            idInstance: String(formData.get("idInstance") ?? "").trim(),
            apiTokenInstance: String(
                formData.get("apiTokenInstance") ?? ""
            ).trim(),
        };

        if (!/^\d{12}$/.test(credentials.idInstance)) {
            return {
                error: "ID Instance должен состоять из 12 цифр",
                submittedCredentials: credentials,
            };
        }

        if (!credentials.apiTokenInstance) {
            return {
                error: "Введите API Token Instance",
                submittedCredentials: credentials,
            };
        }

        try {
            await connect(credentials);
            return { error: null, submittedCredentials: credentials };
        } catch (error) {
            return {
                error:
                    error instanceof Error
                        ? error.message
                        : "Не удалось подключиться",
                submittedCredentials: credentials,
            };
        }
    }, initialState);

    const currentCredentials: Credentials = {
        idInstance: idInstance.trim(),
        apiTokenInstance: apiTokenInstance.trim(),
    };

    const submittedCredentials = formState.submittedCredentials;

    const credentialsHaveNotChanged =
        submittedCredentials !== null &&
        submittedCredentials.idInstance === currentCredentials.idInstance &&
        submittedCredentials.apiTokenInstance ===
            currentCredentials.apiTokenInstance;

    const error = credentialsHaveNotChanged ? formState.error : null;

    return (
        <form className={styles.form} action={submitAction}>
            <h1>Вход в чат</h1>

            <label>
                ID Instance
                <input
                    inputMode="numeric"
                    name="idInstance"
                    value={idInstance}
                    onChange={event =>
                        setIdInstance(event.target.value.replace(/\D/g, ""))
                    }
                    placeholder="310000000000"
                />
            </label>

            <label>
                API Token Instance
                <input
                    type="password"
                    name="apiTokenInstance"
                    value={apiTokenInstance}
                    onChange={event => setApiTokenInstance(event.target.value)}
                />
            </label>

            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" disabled={isPending}>
                {isPending ? "Подключение..." : "Войти"}
            </button>
        </form>
    );
}
