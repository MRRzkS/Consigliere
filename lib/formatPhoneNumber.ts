export function formatPhoneNumber(phone: string): string {
    // 1. Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, '');

    // 2. Replace leading '0' with '62'
    if (cleaned.startsWith('0')) {
        cleaned = '62' + cleaned.substring(1);
    }

    // 3. If it doesn't start with 62, assume it needs it (unless it's already international format without +)
    // This is a heuristic; if it's e.g. 812..., prepend 62.
    if (!cleaned.startsWith('62')) {
        cleaned = '62' + cleaned;
    }

    return cleaned;
}
