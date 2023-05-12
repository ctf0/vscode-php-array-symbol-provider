import * as vscode from 'vscode';
import * as utils from './utils';

export default class SymbolProvider implements vscode.DocumentSymbolProvider {

    public provideDocumentSymbols(document: vscode.TextDocument): vscode.DocumentSymbol[] {
        const result: vscode.DocumentSymbol[] = [];

        if (document) {
            const data = utils.getDocumentArrayItems(document.getText());

            if (data) {
                for (const item of data) {
                    result.push(...getSymbolsList(document, item.expr.items));
                }
            }
        }

        return result;
    }
}

function getSymbolsList(document: vscode.TextDocument, nodeList: Array<any>, childrenLength = 0): vscode.DocumentSymbol[] {
    const result: vscode.DocumentSymbol[] = [];
    let _length = 0;

    for (const node of nodeList) {
        try {
            const provider = new vscode.DocumentSymbol(
                getValue(node, _length),
                node.value.kind,
                getType(node),
                getNodeKeyRange(node, document),
                getNodeKeyRange(node.key || node.value, document),
            );

            if (node.value.items?.length) {
                provider.children = getSymbolsList(document, node.value.items, node.value.items.length - 1);
            }

            if (_length < childrenLength) {
                _length++;
            }

            result.push(provider);
        } catch (error) {
            // console.log(node);
            // console.error(error);
        }
    }

    return result;
}

function getValue(node: any, childrenLength: number) {
    const _key = node.key;
    const _val = node.value;

    if (_key) {
        if (_key.value) {
            return _key.value;
        }

        if (_key.what) {
            return getNestedKeyValue(_key.what);
        }

        if (_key.left) {
            return getNestedKeyValue(_key.left.what);
        }
    }

    if (_val) {
        if (_val.value) {
            return _val.value;
        }

        if (_val.what) {
            return getNestedKeyValue(_val.what);
        }

        if (_val.left) {
            return getNestedKeyValue(_val.left.what);
        }
    }

    if (childrenLength) {
        return `${childrenLength}`;
    }

    return '0';
}

function getNestedKeyValue(_key: any) {
    if (_key.what) {
        return getNestedKeyValue(_key.what);
    }

    return _key.name;
}

function getNodeKeyRange(node: any, document: vscode.TextDocument) {
    const location = node.loc;

    return document.lineAt(location.start.line - 1)
        .range
        .union(document.lineAt(location.end.line - 1).range);
}

function getType(node: any) {
    let type = 0;

    switch (node.value.kind) {
        case 'array':
            type = vscode.SymbolKind.Array;
            break;
        case 'string':
            type = vscode.SymbolKind.String;
            break;
        case 'number':
            type = vscode.SymbolKind.Number;
            break;
        case 'boolean':
            type = vscode.SymbolKind.Boolean;
            break;
        case 'staticlookup':
        case 'name':
            type = vscode.SymbolKind.Class;
            break;
        case 'nullkeyword':
            type = vscode.SymbolKind.Null;
            break;
        case 'call':
            type = vscode.SymbolKind.Function;
            break;
        case 'bin':
            type = vscode.SymbolKind.Package;
            break;
        default:
            type = vscode.SymbolKind.Key;
            break;
    }

    return type;
}
