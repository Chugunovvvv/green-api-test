import type { Credentials, GreenApiNotification } from "../types";
import { GreenApiError } from "./greenApiError";
import { request } from "./httpClient";

const API_BASE_URL = "https://api.green-api.com";

export class GreenApiClient {
    private readonly credentials: Credentials;

    constructor(credentials: Credentials) {
        this.credentials = credentials;
    }

    // формируем запрос
    private endpoint(method: string, suffix = ""): string {
        const id = encodeURIComponent(this.credentials.idInstance);
        const token = encodeURIComponent(this.credentials.apiTokenInstance);

        return `${API_BASE_URL}/waInstance${id}/${method}/${token}${suffix}`;
    }

    // валидируем соединение
    async validateConnection(): Promise<void> {
        const state = await request<{ stateInstance?: string }>(
            this.endpoint("getStateInstance")
        );

        if (state?.stateInstance !== "authorized") {
            throw new GreenApiError(
                `Инстанс не готов к работе: ${state?.stateInstance ?? "Ошибка авторизации"}`
            );
        }

        const settings = await request<{
            webhookUrl?: string;
            incomingWebhook?: string;
        }>(this.endpoint("getSettings"));

        if (settings.webhookUrl?.trim()) {
            throw new GreenApiError(
                "webhookUrl в настройках инстанса должен быть пустым"
            );
        }

        if (settings.incomingWebhook !== "yes") {
            throw new GreenApiError(
                "Включите получение уведомлений о входящих сообщениях в настройках инстанса"
            );
        }
    }

    // проверяем существование аккаунта
    async checkAccount(correspondent: string): Promise<string> {
        const account = correspondent.startsWith("@")
            ? { username: correspondent }
            : { phoneNumber: Number(correspondent) };

        const result = await request<{
            exist?: boolean;
            chatId?: string;
            status?: boolean;
            reason?: string;
            data?: {
                reason?: string;
            };
        }>(this.endpoint("checkAccount"), {
            method: "POST",
            data: account,
        });

        if (result.status === false) {
            throw new GreenApiError(
                result.reason ??
                    result.data?.reason ??
                    "Не удалось проверить аккаунт Telegram"
            );
        }

        if (!result.exist || !result.chatId) {
            throw new GreenApiError("Аккаунт Telegram не найден");
        }

        return result.chatId;
    }

    // отправляем сообщение
    async sendMessage(chatId: string, message: string): Promise<string> {
        const result = await request<{ idMessage?: string }>(
            this.endpoint("sendMessage"),
            {
                method: "POST",
                data: { chatId, message },
            }
        );

        if (!result.idMessage) {
            throw new GreenApiError("Не найден идентификатор сообщения");
        }

        return result.idMessage;
    }

    // получаем уведомление
    receiveNotification(
        signal: AbortSignal
    ): Promise<GreenApiNotification | null> {
        return request<GreenApiNotification | null>(
            this.endpoint("receiveNotification", "?receiveTimeout=60"),
            { signal }
        );
    }

    // удаляем уведомление
    async deleteNotification(receiptId: number): Promise<void> {
        await request(this.endpoint("deleteNotification", `/${receiptId}`), {
            method: "DELETE",
        });
    }
}
