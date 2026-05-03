"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDecorations = getDecorations;
// src/decorators.ts
const vscode = require("vscode");
function getDecorations() {
    const config = vscode.workspace.getConfiguration('elval.helper');
    // Вспомогательная функция для получения стиля текста
    const getTextDecoration = (key) => {
        const val = config.get(key);
        return (val === 'none') ? undefined : val;
    };
    return {
        directive: vscode.window.createTextEditorDecorationType({
            color: config.get('colors.directive'),
            fontWeight: config.get('styles.directive.fontWeight'),
            fontStyle: config.get('styles.directive.fontStyle')
        }),
        paramSimple: vscode.window.createTextEditorDecorationType({
            color: config.get('colors.paramSimple'),
            fontWeight: 'bold' // Параметры всегда жирные для заметности
        }),
        paramKv: vscode.window.createTextEditorDecorationType({
            color: config.get('colors.paramKv'),
            fontWeight: 'bold'
        }),
        value: vscode.window.createTextEditorDecorationType({
            color: config.get('colors.value'),
            fontWeight: config.get('styles.value.fontWeight'),
            textDecoration: getTextDecoration('styles.value.textDecoration')
        }),
        oaKey: vscode.window.createTextEditorDecorationType({
            color: config.get('colors.oaKey'),
            fontStyle: 'italic' // Ключи OA обычно курсивом
        }),
        location: vscode.window.createTextEditorDecorationType({
            color: config.get('colors.location'),
            fontWeight: 'bold'
        }),
        paramName: vscode.window.createTextEditorDecorationType({
            color: config.get('colors.paramName'),
            fontWeight: 'bold',
            // Убрали backgroundColor и borderRadius для чистоты
        })
    };
}
//# sourceMappingURL=decorators.js.map