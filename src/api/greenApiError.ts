export class GreenApiError extends Error {
    readonly status?: number;

    constructor(message: string, status?: number) {
        super(message);
        this.name = "GreenApiError";
        this.status = status;
    }
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

export function getResponseMessage(data: unknown): string | undefined {
    if (!isRecord(data)) {
        return undefined;
    }

    const nestedMessage = [
        data.correspondentsStatus,
        data.invokeStatus,
        data.data,
    ]
        .filter(isRecord)
        .map(value => value.description ?? value.reason)
        .find(value => typeof value === "string");

    const message =
        data.reason ?? data.description ?? data.message ?? nestedMessage;

    return typeof message === "string" ? message : undefined;
}
