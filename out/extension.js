"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const completionProvider_1 = require("./completionProvider");
const evlHandler_1 = require("./handlers/evlHandler");
const oaHandler_1 = require("./handlers/oaHandler");
const decorators_1 = require("./decorators");
// Глобальная переменная для хранения последних примененных декораций (для очистки)
let currentDecorations = null;
function activate(context) {
    console.log('✅ ElVal Helper Activated!');
    context.subscriptions.push((0, completionProvider_1.createCompletionProvider)());
    function updateAllDecorations(forceRefresh = false) {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== 'go') {
            return;
        }
        // Если форсируем обновление (смена цвета), очищаем старые декорации
        if (forceRefresh && currentDecorations) {
            // Устанавливаем пустые диапазоны для старых типов, чтобы "стереть" их
            editor.setDecorations(currentDecorations.directive, []);
            editor.setDecorations(currentDecorations.paramSimple, []);
            editor.setDecorations(currentDecorations.paramKv, []);
            editor.setDecorations(currentDecorations.value, []);
            editor.setDecorations(currentDecorations.oaKey, []);
            editor.setDecorations(currentDecorations.location, []);
            editor.setDecorations(currentDecorations.paramName, []);
        }
        // Получаем НОВЫЕ декорации из настроек
        const decorations = (0, decorators_1.getDecorations)();
        currentDecorations = decorations; // Сохраняем ссылку на текущие
        const lines = editor.document.getText().split('\n');
        const allDirectives = [];
        const allSimpleParams = [];
        const allKvParams = [];
        const allValues = [];
        const allOaKeys = [];
        const allLocations = [];
        const allParamNames = [];
        lines.forEach((line, lineIndex) => {
            const commentMatch = line.match(/\/\/(.*)/);
            if (!commentMatch)
                return;
            const fullCommentText = commentMatch[1];
            const baseOffset = line.indexOf('//') + 2;
            const evlResult = {
                directives: [],
                simpleParams: [],
                kvParams: [],
                values: []
            };
            const oaResult = {
                oaKeys: [],
                values: [],
                locations: [],
                paramNames: []
            };
            (0, evlHandler_1.handleEvlAnnotations)(fullCommentText, lineIndex, baseOffset, evlResult, line);
            (0, oaHandler_1.handleOaAnnotations)(fullCommentText, lineIndex, baseOffset, oaResult, line);
            allDirectives.push(...evlResult.directives);
            allSimpleParams.push(...evlResult.simpleParams);
            allKvParams.push(...evlResult.kvParams);
            allValues.push(...evlResult.values, ...oaResult.values);
            allOaKeys.push(...oaResult.oaKeys);
            allLocations.push(...oaResult.locations);
            allParamNames.push(...oaResult.paramNames);
        });
        // Применяем НОВЫЕ декорации
        editor.setDecorations(decorations.directive, allDirectives);
        editor.setDecorations(decorations.paramSimple, allSimpleParams);
        editor.setDecorations(decorations.paramKv, allKvParams);
        editor.setDecorations(decorations.value, allValues);
        editor.setDecorations(decorations.oaKey, allOaKeys);
        editor.setDecorations(decorations.location, allLocations);
        editor.setDecorations(decorations.paramName, allParamNames);
    }
    // Команда смены цвета
    const changeColorsCommand = vscode.commands.registerCommand('elval.helper.changeColors', async () => {
        const config = vscode.workspace.getConfiguration('elval.helper');
        const settingsList = [
            // Цвета
            { key: 'colors.directive', label: '🎨 Color: Directives' },
            { key: 'colors.value', label: '🎨 Color: Values' },
            // Стили для Директив
            { key: 'styles.directive.fontWeight', label: '💪 Style: Directives Weight', type: 'enum', options: ['normal', 'bold'] },
            { key: 'styles.directive.fontStyle', label: '↗️ Style: Directives Italic', type: 'enum', options: ['normal', 'italic'] },
            // Стили для Значений
            { key: 'styles.value.fontWeight', label: '💪 Style: Values Weight', type: 'enum', options: ['normal', 'bold'] },
            { key: 'styles.value.textDecoration', label: '〰️ Style: Values Underline', type: 'enum', options: ['none', 'underline', 'wavy'] }
        ];
        const selected = await vscode.window.showQuickPick(settingsList.map(s => ({
            label: s.label,
            description: `Current: ${config.get(s.key)}`,
            key: s.key,
            type: s.type,
            options: s.options
        })), { placeHolder: 'Select setting to change' });
        if (!selected)
            return;
        let newValue;
        // ✅ ДОБАВЛЕНА ПРОВЕРКА: если тип enum И есть options
        if (selected.type === 'enum' && selected.options) {
            const picked = await vscode.window.showQuickPick(selected.options.map(opt => ({
                label: opt,
                description: opt === config.get(selected.key) ? '(Current)' : ''
            })), { placeHolder: `Choose value for ${selected.label}` });
            if (picked)
                newValue = picked.label;
        }
        else {
            // Ввод цвета (HEX)
            const currentVal = config.get(selected.key);
            newValue = await vscode.window.showInputBox({
                prompt: `Enter new value for "${selected.label}"`,
                value: currentVal,
                validateInput: (value) => {
                    // Простая проверка только для цветов
                    if (selected.key.startsWith('colors.') && !/^#([0-9A-F]{3}){1,2}$/i.test(value)) {
                        return 'Invalid HEX color';
                    }
                    return null;
                }
            });
        }
        if (newValue !== undefined) {
            await config.update(selected.key, newValue, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage(`Setting updated!`);
            updateAllDecorations(true);
        }
    });
    context.subscriptions.push(changeColorsCommand);
    // Подписка на изменение настроек (если пользователь меняет их вручную в settings.json)
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('elval.helper')) {
            updateAllDecorations(true);
        }
    }));
    vscode.window.onDidChangeActiveTextEditor(() => updateAllDecorations(false));
    vscode.workspace.onDidChangeTextDocument(event => {
        if (event.document === vscode.window.activeTextEditor?.document) {
            updateAllDecorations(false);
        }
    });
    setTimeout(() => updateAllDecorations(false), 500);
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(() => updateAllDecorations(false)), vscode.workspace.onDidChangeTextDocument(event => {
        if (event.document === vscode.window.activeTextEditor?.document) {
            updateAllDecorations(false);
        }
    }));
}
function deactivate() { }
//# sourceMappingURL=extension.js.map