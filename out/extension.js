"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
function activate(context) {
    const provider = vscode.languages.registerCompletionItemProvider('go', {
        provideCompletionItems(document, position) {
            const linePrefix = document.lineAt(position).text.substr(0, position.character);
            // Работаем только если есть маркеры аннотаций
            if (!linePrefix.includes('@evl:') && !linePrefix.includes('@oa:')) {
                return undefined;
            }
            const completionItems = [];
            // --- ElVal Validation Params ---
            if (linePrefix.includes('@evl:validate')) {
                const params = [
                    'required', 'optional', 'not-zero',
                    'email', 'uuid', 'phone', 'ip', 'url', 'http_url',
                    'min:', 'max:', 'len:',
                    'gt:', 'lt:', 'gte:', 'lte:', 'eq:', 'neq:',
                    'pattern:', 'enum:', 'contains:', 'starts_with:', 'ends_with:',
                    'ctx-get:', 'httpctx-get:', 'env-get:',
                    'default:', 'prefix:', 'suffix:'
                ];
                params.forEach(param => {
                    const item = new vscode.CompletionItem(param, vscode.CompletionItemKind.Property);
                    item.detail = 'ElVal Parameter';
                    completionItems.push(item);
                });
            }
            // --- ElVal Decorators ---
            if (linePrefix.includes('@evl:decor')) {
                ['uuid-gen', 'time-now'].forEach(dec => {
                    const item = new vscode.CompletionItem(dec, vscode.CompletionItemKind.Value);
                    item.detail = 'ElVal Decorator';
                    completionItems.push(item);
                });
            }
            // --- OpenAPI Location (@oa:in) ---
            if (linePrefix.includes('@oa:in')) {
                ['query', 'header', 'path', 'cookie'].forEach(loc => {
                    const item = new vscode.CompletionItem(loc, vscode.CompletionItemKind.Enum);
                    item.detail = 'OpenAPI Location';
                    completionItems.push(item);
                });
            }
            // --- Other OpenAPI Keys ---
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
    }, ':', '@' // Триггеры автодополнения
    );
    context.subscriptions.push(provider);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map