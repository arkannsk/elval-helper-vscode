"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCompletionProvider = createCompletionProvider;
// src/completionProvider.ts
const vscode = require("vscode");
const utils_1 = require("./utils"); // Теперь импорт должен работать
function createCompletionProvider() {
    return vscode.languages.registerCompletionItemProvider('go', {
        provideCompletionItems(document, position) {
            const linePrefix = document.lineAt(position).text.substr(0, position.character);
            if (!linePrefix.includes('@evl:') && !linePrefix.includes('@oa:')) {
                return undefined;
            }
            const completionItems = [];
            if (linePrefix.includes('@evl:validate')) {
                // Явно указываем типы, чтобы избежать ошибок
                const params = Array.from(utils_1.SIMPLE_PARAMS).concat(utils_1.KV_PARAM_PREFIXES.map((p) => p + ':'));
                params.forEach((param) => {
                    const item = new vscode.CompletionItem(param, vscode.CompletionItemKind.Property);
                    item.detail = 'ElVal Parameter';
                    completionItems.push(item);
                });
            }
            if (linePrefix.includes('@evl:decor')) {
                ['uuid-gen', 'time-now'].forEach(dec => {
                    const item = new vscode.CompletionItem(dec, vscode.CompletionItemKind.Value);
                    item.detail = 'ElVal Decorator';
                    completionItems.push(item);
                });
            }
            if (linePrefix.includes('@oa:in')) {
                ['query', 'header', 'path', 'cookie'].forEach(loc => {
                    const item = new vscode.CompletionItem(loc, vscode.CompletionItemKind.Enum);
                    item.detail = 'OpenAPI Location';
                    completionItems.push(item);
                });
            }
            else if (linePrefix.includes('@oa:')) {
                const oaKeys = [
                    'title', 'description', 'example', 'format',
                    'minimum', 'maximum', 'minLength', 'maxLength',
                    'pattern', 'enum', 'default', 'readOnly', 'writeOnly'
                ];
                oaKeys.forEach(key => {
                    const item = new vscode.CompletionItem(key, vscode.CompletionItemKind.Field);
                    item.detail = 'OpenAPI Key';
                    completionItems.push(item);
                });
            }
            return completionItems;
        }
    }, ':', '@');
}
//# sourceMappingURL=completionProvider.js.map