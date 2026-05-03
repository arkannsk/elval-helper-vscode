// src/utils.ts

export const SIMPLE_PARAMS = new Set<string>([
    'required', 'optional', 'not-zero',
    'email', 'uuid', 'phone', 'ip', 'url', 'http_url', 'dsn',
    'trim', 'lowercase', 'uppercase',
    'inline', 'flatten',
    'time-now', 'uuid-gen'
]);

export const KV_PARAM_PREFIXES: string[] = [
    'min', 'max', 'len',
    'gt', 'lt', 'gte', 'lte', 'eq', 'neq',
    'pattern', 'enum', 'contains', 'starts_with', 'ends_with',
    'ctx-get', 'httpctx-get', 'env-get',
    'default', 'prefix', 'suffix',
    'ref', 'type'
];

export function isKvParam(paramName: string): boolean {
    return KV_PARAM_PREFIXES.some(prefix => paramName.startsWith(`${prefix}:`));
}

export function findWordEnd(text: string, start: number): number {
    let j = start;
    while (j < text.length && !/\s/.test(text[j]) && text[j] !== '\n' && text[j] !== '\r') {
        j++;
    }
    // Убедимся, что мы не выходим за пределы строки
    return Math.min(j, text.length);
}

export function skipWhitespace(text: string, start: number): number {
    let j = start;
    while (j < text.length && /\s/.test(text[j])) {
        j++;
    }
    return j;
}

export function findKeyEnd(text: string, start: number): number {
    let j = start;
    while (j < text.length && /[a-zA-Z0-9._]/.test(text[j])) {
        j++;
    }
    return j;
}

export function skipWhitespaceBackwards(text: string, pos: number): number {
    let j = pos - 1;
    while (j >= 0 && /\s/.test(text[j])) {
        j--;
    }
    return j + 1;
}
