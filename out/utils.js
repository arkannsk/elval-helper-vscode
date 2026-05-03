"use strict";
// src/utils.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.KV_PARAM_PREFIXES = exports.SIMPLE_PARAMS = void 0;
exports.isKvParam = isKvParam;
exports.findWordEnd = findWordEnd;
exports.skipWhitespace = skipWhitespace;
exports.findKeyEnd = findKeyEnd;
exports.skipWhitespaceBackwards = skipWhitespaceBackwards;
exports.SIMPLE_PARAMS = new Set([
    'required', 'optional', 'not-zero',
    'email', 'uuid', 'phone', 'ip', 'url', 'http_url', 'dsn',
    'trim', 'lowercase', 'uppercase',
    'inline', 'flatten',
    'time-now', 'uuid-gen'
]);
exports.KV_PARAM_PREFIXES = [
    'min', 'max', 'len',
    'gt', 'lt', 'gte', 'lte', 'eq', 'neq',
    'pattern', 'enum', 'contains', 'starts_with', 'ends_with',
    'ctx-get', 'httpctx-get', 'env-get',
    'default', 'prefix', 'suffix',
    'ref', 'type'
];
function isKvParam(paramName) {
    return exports.KV_PARAM_PREFIXES.some(prefix => paramName.startsWith(`${prefix}:`));
}
function findWordEnd(text, start) {
    let j = start;
    while (j < text.length && !/\s/.test(text[j]) && text[j] !== '\n' && text[j] !== '\r') {
        j++;
    }
    // Убедимся, что мы не выходим за пределы строки
    return Math.min(j, text.length);
}
function skipWhitespace(text, start) {
    let j = start;
    while (j < text.length && /\s/.test(text[j])) {
        j++;
    }
    return j;
}
function findKeyEnd(text, start) {
    let j = start;
    while (j < text.length && /[a-zA-Z0-9._]/.test(text[j])) {
        j++;
    }
    return j;
}
function skipWhitespaceBackwards(text, pos) {
    let j = pos - 1;
    while (j >= 0 && /\s/.test(text[j])) {
        j--;
    }
    return j + 1;
}
//# sourceMappingURL=utils.js.map