export function normalizeCorrespondent(value: string): string {
    const correspondent = value.trim();

    if (correspondent.startsWith("@")) {
        return correspondent;
    }

    return correspondent.replace(/\D/g, "");
}

export function isSupportedCorrespondent(value: string): boolean {
    const correspondent = normalizeCorrespondent(value);

    return (
        /^\d{7,15}$/.test(correspondent) ||
        /^@[a-zA-Z0-9_]{5,32}$/.test(correspondent)
    );
}

export function formatCorrespondent(value: string): string {
    const correspondent = normalizeCorrespondent(value);

    if (correspondent.startsWith("@")) {
        return correspondent;
    }

    if (/^7\d{10}$/.test(correspondent)) {
        return `+7 ${correspondent.slice(1, 4)} ${correspondent.slice(4, 7)}-${correspondent.slice(7, 9)}-${correspondent.slice(9)}`;
    }

    if (/^375\d{9}$/.test(correspondent)) {
        return `+375 ${correspondent.slice(3, 5)} ${correspondent.slice(5, 8)}-${correspondent.slice(8, 10)}-${correspondent.slice(10)}`;
    }

    return `+${correspondent}`;
}
