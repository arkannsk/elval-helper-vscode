// src/handlers/oaHandler.ts
import * as vscode from 'vscode';
import { 
    findWordEnd, 
    skipWhitespace, 
    findKeyEnd, 
    skipWhitespaceBackwards 
} from '../utils';

export interface DecorationResult {
    oaKeys: vscode.DecorationOptions[];
    values: vscode.DecorationOptions[];
    locations: vscode.DecorationOptions[];
    paramNames: vscode.DecorationOptions[];
}

export function handleOaAnnotations(
    commentContent: string, 
    lineIndex: number, 
    baseOffset: number,
    result: DecorationResult,
    fullLineText: string
) {
    const DEBUG = true;
    if (DEBUG) console.log(`[OA] Processing: "${commentContent}"`);

    const trimmedContent = commentContent.trimStart();
    const leadingSpaces = commentContent.length - trimmedContent.length;
    
    if (!trimmedContent.startsWith('@oa:')) {
        return;
    }

    const keyStartInComment = leadingSpaces;
    const keyEndInComment = findKeyEnd(commentContent, keyStartInComment + 4);
    const fullKey = commentContent.substring(keyStartInComment + 4, keyEndInComment);

    if (DEBUG) console.log(`[OA] Found key '@oa:${fullKey}' at [${keyStartInComment}, ${keyEndInComment})`);

    const start = new vscode.Position(lineIndex, baseOffset + keyStartInComment);
    const end = new vscode.Position(lineIndex, baseOffset + keyEndInComment);
    result.oaKeys.push({ range: new vscode.Range(start, end) });

    let i = keyEndInComment;
    const len = commentContent.length;

    while (i < len && /\s/.test(commentContent[i])) {
        i++;
    }

    if (i >= len) return;

    const valueStartInComment = i;
    let valueEndInComment = len;

    if (fullKey === 'in') {
        valueEndInComment = findWordEnd(commentContent, valueStartInComment);
        const locationValue = commentContent.substring(valueStartInComment, valueEndInComment);

        if (['query', 'header', 'path', 'cookie'].includes(locationValue)) {
            if (DEBUG) console.log(`[OA] Valid location: "${locationValue}"`);
            
            const locStart = new vscode.Position(lineIndex, baseOffset + valueStartInComment);
            const locEnd = new vscode.Position(lineIndex, baseOffset + valueEndInComment);
            result.locations.push({ range: new vscode.Range(locStart, locEnd) });

            const paramNameStartInComment = skipWhitespace(commentContent, valueEndInComment);
            if (paramNameStartInComment < len && !/\n|\r/.test(commentContent[paramNameStartInComment])) {
                const paramNameEndInComment = findWordEnd(commentContent, paramNameStartInComment);
                
                if (DEBUG) {
                    const paramName = commentContent.substring(paramNameStartInComment, paramNameEndInComment);
                    console.log(`[OA] Param name: "${paramName}" at [${paramNameStartInComment}, ${paramNameEndInComment})`);
                }

                const pStart = new vscode.Position(lineIndex, baseOffset + paramNameStartInComment);
                const pEnd = new vscode.Position(lineIndex, baseOffset + paramNameEndInComment);
                result.paramNames.push({ range: new vscode.Range(pStart, pEnd) });
                
                i = paramNameEndInComment;
            } else {
                i = valueEndInComment;
            }
        }
    } else {
        // ... остальная логика для других ключей ...
        valueEndInComment = len;
        const vStart = new vscode.Position(lineIndex, baseOffset + valueStartInComment);
        const vEnd = new vscode.Position(lineIndex, baseOffset + valueEndInComment);
        
        if (vStart.character < vEnd.character) {
             result.values.push({ range: new vscode.Range(vStart, vEnd) });
        }
    }
}
