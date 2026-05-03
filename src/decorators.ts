// src/decorators.ts
import * as vscode from 'vscode';

export function getDecorations() {
    const config = vscode.workspace.getConfiguration('elval.helper');

    // Вспомогательная функция для получения стиля текста
    const getTextDecoration = (key: string) => {
        const val = config.get<string>(key);
        return (val === 'none') ? undefined : val;
    };

    return {
        directive: vscode.window.createTextEditorDecorationType({
            color: config.get<string>('colors.directive'),
            fontWeight: config.get<'normal' | 'bold'>('styles.directive.fontWeight'),
            fontStyle: config.get<'normal' | 'italic'>('styles.directive.fontStyle')
        }),
        paramSimple: vscode.window.createTextEditorDecorationType({
            color: config.get<string>('colors.paramSimple'),
            fontWeight: 'bold' // Параметры всегда жирные для заметности
        }),
        paramKv: vscode.window.createTextEditorDecorationType({
            color: config.get<string>('colors.paramKv'),
            fontWeight: 'bold'
        }),
        value: vscode.window.createTextEditorDecorationType({
            color: config.get<string>('colors.value'),
            fontWeight: config.get<'normal' | 'bold'>('styles.value.fontWeight'),
            textDecoration: getTextDecoration('styles.value.textDecoration')
        }),
        oaKey: vscode.window.createTextEditorDecorationType({
            color: config.get<string>('colors.oaKey'),
            fontStyle: 'italic' // Ключи OA обычно курсивом
        }),
        location: vscode.window.createTextEditorDecorationType({
            color: config.get<string>('colors.location'),
            fontWeight: 'bold'
        }),
        paramName: vscode.window.createTextEditorDecorationType({
            color: config.get<string>('colors.paramName'),
            fontWeight: 'bold',
            // Убрали backgroundColor и borderRadius для чистоты
        })
    };
}
