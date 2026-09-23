import { GreenApiClient } from "../api/greenApiClient";
import { mapIncomingMessage } from "../api/mapIncomingMessage";
import type { IncomingMessage } from "../types";

type PollingState = "online" | "reconnecting";

type PollingCallbacks = {
    onMessage: (message: IncomingMessage) => void | Promise<void>;
    onStateChange: (state: PollingState, error?: string) => void;
};

function abortableDelay(
    milliseconds: number,
    signal: AbortSignal
): Promise<void> {
    return new Promise(resolve => {
        if (signal.aborted) {
            resolve();
            return;
        }

        const finish = () => {
            signal.removeEventListener("abort", finish);
            window.clearTimeout(timeoutId);
            resolve();
        };

        const timeoutId = window.setTimeout(finish, milliseconds);
        signal.addEventListener("abort", finish, { once: true });
    });
}

export class NotificationPollingService {
    private controller: AbortController | null = null;
    private runningTask: Promise<void> | null = null;
    private readonly client: GreenApiClient;
    private readonly callbacks: PollingCallbacks;

    constructor(client: GreenApiClient, callbacks: PollingCallbacks) {
        this.client = client;
        this.callbacks = callbacks;
    }

    start(): void {
        if (this.runningTask) {
            return;
        }

        this.controller = new AbortController();
        this.runningTask = this.run(this.controller.signal).finally(() => {
            this.runningTask = null;
            this.controller = null;
        });
    }

    stop(): void {
        this.controller?.abort();
    }

    private async run(signal: AbortSignal): Promise<void> {
        let retryDelay = 1_000;

        while (!signal.aborted) {
            try {
                const notification =
                    await this.client.receiveNotification(signal);

                if (signal.aborted) {
                    return;
                }

                this.callbacks.onStateChange("online");
                retryDelay = 1_000;

                if (!notification) {
                    await abortableDelay(1_000, signal);
                    continue;
                }

                const message = mapIncomingMessage(notification);

                if (message) {
                    await this.callbacks.onMessage(message);
                }

                await this.client.deleteNotification(notification.receiptId);
            } catch (error) {
                if (
                    signal.aborted ||
                    (error instanceof DOMException &&
                        error.name === "AbortError")
                ) {
                    return;
                }

                this.callbacks.onStateChange(
                    "reconnecting",
                    error instanceof Error
                        ? error.message
                        : "Ошибка получения уведомлений"
                );

                await abortableDelay(retryDelay, signal);
                retryDelay = Math.min(retryDelay * 2, 15_000);
            }
        }
    }
}
