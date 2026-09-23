import axios, { type AxiosRequestConfig } from "axios";
import { GreenApiError, getResponseMessage } from "./greenApiError";

const httpClient = axios.create({
    headers: {
        Accept: "application/json",
    },
});

export async function request<T>(
    url: string,
    config?: AxiosRequestConfig
): Promise<T> {
    try {
        const response = await httpClient.request<T>({ ...config, url });
        return response.data;
    } catch (error) {
        if (axios.isCancel(error)) {
            throw new DOMException("Request aborted");
        }

        if (axios.isAxiosError(error) && error.response) {
            throw new GreenApiError(
                getResponseMessage(error.response.data) ??
                    `Ошибка - ${error.message}`,
                error.response.status
            );
        }

        throw new GreenApiError("Не удалось выполнить запрос к GREEN-API");
    }
}
