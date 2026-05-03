import * as vscode from 'vscode';
import { 
    SIMPLE_PARAMS, 
    isKvParam, 
    findWordEnd, 
    skipWhitespace 
} from '../utils';

export interface DecorationResult {
    directives: vscode.DecorationOptions[];
    simpleParams: vscode.DecorationOptions[];
    kvParams: vscode.DecorationOptions[];
    values: vscode.DecorationOptions[];
}

export function handleEvlAnnotations(
    commentContent: string, 
    lineIndex: number, 
    baseOffset: number,
    result: DecorationResult,
    fullLineText: string
) {
    const DEBUG = true;

    // 1. Проверяем, начинается ли комментарий с @evl:
    // Пропускаем начальные пробелы в комментарии
    const trimmedContent = commentContent.trimStart();
    const leadingSpaces = commentContent.length - trimmedContent.length;
    
    if (!trimmedContent.startsWith('@evl:')) {
        // Если комментарий не начинается с @evl:, значит это просто текст, игнорируем
        return;
    }

    if (DEBUG) {
        console.log(`[ElVal] Processing line ${lineIndex}: "${fullLineText}"`);
        console.log(`[ElVal] Comment content: "${commentContent}"`);
        console.log(`[ElVal] Base offset: ${baseOffset}, Leading spaces: ${leadingSpaces}`);
    }

    // 2. Парсим директиву (@evl:validate, @evl:decor, etc.)
    const directiveStartInComment = leadingSpaces;
    // +5 пропускает "@evl:"
    const directiveEndInComment = findWordEnd(commentContent, directiveStartInComment + 5);
    const directiveName = commentContent.substring(directiveStartInComment + 5, directiveEndInComment);

    if (DEBUG) {
        console.log(`[ElVal] Found directive '@evl:${directiveName}' at [${directiveStartInComment}, ${directiveEndInComment})`);
        const debugStr = fullLineText.substring(baseOffset + directiveStartInComment, baseOffset + directiveEndInComment);
        console.log(`[ElVal] Directive chars in line: "${debugStr}"`);
    }

    // Подсвечиваем саму директиву
    const dirStart = new vscode.Position(lineIndex, baseOffset + directiveStartInComment);
    const dirEnd = new vscode.Position(lineIndex, baseOffset + directiveEndInComment);
    result.directives.push({ range: new vscode.Range(dirStart, dirEnd) });

    // 3. Обрабатываем содержимое после директивы
    let i = directiveEndInComment;
    const len = commentContent.length;

    // Если это декоратор (@evl:decor uuid-gen), обрабатываем значение отдельно
    if (directiveName === 'decor') {
        const valueStartInComment = skipWhitespace(commentContent, i);
        if (valueStartInComment < len) {
            const valueEndInComment = findWordEnd(commentContent, valueStartInComment);
            
            if (DEBUG) {
                console.log(`[ElVal] Decor value at [${valueStartInComment}, ${valueEndInComment})`);
                const debugStr = fullLineText.substring(baseOffset + valueStartInComment, baseOffset + valueEndInComment);
                console.log(`[ElVal] Value chars in line: "${debugStr}"`);
            }

            const vStart = new vscode.Position(lineIndex, baseOffset + valueStartInComment);
            const vEnd = new vscode.Position(lineIndex, baseOffset + valueEndInComment);
            
            // Проверка границ
            const lineLength = fullLineText.length;
            if (vEnd.character <= lineLength) {
                result.values.push({ range: new vscode.Range(vStart, vEnd) });
            }
            i = valueEndInComment;
        }
        return; // Декоратор обычно один, завершаем
    }

    // Для validate/rewrite — обрабатываем параметры
    // Пропускаем пробелы после директивы
    i = skipWhitespace(commentContent, i);

    // Цикл по всем параметрам в этой строке
    while (i < len && !/\n|\r/.test(commentContent[i])) {
        const paramStartInComment = i;
        const paramEndInComment = findWordEnd(commentContent, paramStartInComment);
        
        // Если не нашли слово (конец строки или пробелы до конца), выходим
        if (paramStartInComment >= paramEndInComment) break;

        const paramName = commentContent.substring(paramStartInComment, paramEndInComment);

        if (DEBUG) {
            console.log(`[ElVal] Found param '${paramName}' at [${paramStartInComment}, ${paramEndInComment})`);
            const debugStr = fullLineText.substring(baseOffset + paramStartInComment, baseOffset + paramEndInComment);
            console.log(`[ElVal] Param chars in line: "${debugStr}"`);
        }

        if (SIMPLE_PARAMS.has(paramName)) {
            // Простой параметр (required, email...)
            const pStart = new vscode.Position(lineIndex, baseOffset + paramStartInComment);
            const pEnd = new vscode.Position(lineIndex, baseOffset + paramEndInComment);
            result.simpleParams.push({ range: new vscode.Range(pStart, pEnd) });
        } else if (isKvParam(paramName)) {
            // KV-параметр (min:10, pattern:email...)
            const colonIndex = paramName.indexOf(':');
            if (colonIndex > 0) {
                // Имя параметра (min:)
                const pStart = new vscode.Position(lineIndex, baseOffset + paramStartInComment);
                const pEnd = new vscode.Position(lineIndex, baseOffset + paramStartInComment + colonIndex + 1);
                result.kvParams.push({ range: new vscode.Range(pStart, pEnd) });

                // Значение (10, email...)
                const valueStartInLine = baseOffset + paramStartInComment + colonIndex + 1;
                const valueEndInLine = baseOffset + paramEndInComment;

                if (DEBUG) {
                    console.log(`[ElVal] KV Value for '${paramName}' at [${valueStartInLine}, ${valueEndInLine})`);
                    const lineLength = fullLineText.length;
                    const actualValue = fullLineText.substring(valueStartInLine, Math.min(valueEndInLine, lineLength));
                    console.log(`[ElVal] Value chars in line: "${actualValue}"`);
                }

                 if (valueStartInLine < valueEndInLine) {
                            const vStart = new vscode.Position(lineIndex, valueStartInLine);
                            // Гарантируем, что end не выходит за пределы строки
                            const lineLength = fullLineText.length;
                            const safeEndChar = Math.min(valueEndInLine, lineLength);
                            
                            // Если safeEndChar == valueStartInLine, значит значение пустое
                            if (safeEndChar > valueStartInLine) {
                                const vEnd = new vscode.Position(lineIndex, safeEndChar);
                                result.values.push({ range: new vscode.Range(vStart, vEnd) });
                                
                                if (DEBUG) {
                                    console.log(`[ElVal] ✅ Added value range [${vStart.character}, ${vEnd.character}) for "${fullLineText.substring(vStart.character, vEnd.character)}"`);
                                }
                            } else {
                                if (DEBUG) console.warn(`[ElVal] ⚠️ Skipped empty value at line ${lineIndex}`);
                            }
                        }
            }
        }

        // Переходим к следующему слову
        i = skipWhitespace(commentContent, paramEndInComment);
    }
}
