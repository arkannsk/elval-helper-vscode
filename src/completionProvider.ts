// src/completionProvider.ts
import * as vscode from 'vscode';
import { SIMPLE_PARAMS, KV_PARAM_PREFIXES } from './utils'; // Теперь импорт должен работать

export function createCompletionProvider(): vscode.Disposable {
    return vscode.languages.registerCompletionItemProvider(
        'go',
        {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                const linePrefix = document.lineAt(position).text.substr(0, position.character);
                
                if (!linePrefix.includes('@evl:') && !linePrefix.includes('@oa:')) {
                    return undefined;
                }

                const completionItems: vscode.CompletionItem[] = [];

                if (linePrefix.includes('@evl:validate')) {
                    // Явно указываем типы, чтобы избежать ошибок
                    const params = Array.from(SIMPLE_PARAMS).concat(
                        KV_PARAM_PREFIXES.map((p: string) => p + ':')
                    );
                    
                    params.forEach((param: string) => {
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
                } else if (linePrefix.includes('@oa:')) {
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
        },
        ':', '@'
    );
}
