import * as vscode from 'vscode';
import * as utils from './utils';

export default class SymbolProvider implements vscode.DocumentSymbolProvider {

    public provideDocumentSymbols(document: vscode.TextDocument): vscode.DocumentSymbol[] {
        const result: vscode.DocumentSymbol[] = []

        if (document) {
            const DOCUMENT_ARRAY_ITEMS: any = utils.getDocumentArrayItems(document.getText())

            try {
                if (DOCUMENT_ARRAY_ITEMS.length) {
                    result.push(...getSymbolsList(document, DOCUMENT_ARRAY_ITEMS))
                }
            } catch (error) {
                // console.error(error);
            }
        }

        return result
    }
}

function getSymbolsList(document: vscode.TextDocument, nodeList: Array<any>): vscode.DocumentSymbol[] {
    const result: vscode.DocumentSymbol[] = []

    for (const node of nodeList) {
        // because indexed arrays only have values
        const { value = '/', loc, kind } = node.key || node.value
        const selectionRange = utils.locationToRange(loc, value)
        let type: number = 0

        switch (node.value.kind) {
            case 'array':
                type = vscode.SymbolKind.Array
                break;
            case 'string':
                type = vscode.SymbolKind.String
                break;
            case 'number':
                type = vscode.SymbolKind.Number
                break;
            case 'bool':
                type = vscode.SymbolKind.Boolean
                break;
            default:
                type = vscode.SymbolKind.Key
                break;
        }

        if (value === '/') {
            type = vscode.SymbolKind.Null
        }

        let provider = new vscode.DocumentSymbol(
            value,
            kind,
            type,
            document.lineAt(loc.start.line - 1).range,
            selectionRange
        )

        if (type === vscode.SymbolKind.Array) {
            provider.children = getSymbolsList(document, node.value.items)
        }

        result.push(provider)
    }

    return result
}
