import * as vscode from 'vscode'
import * as utils from './utils'

export default class SymbolProvider implements vscode.DocumentSymbolProvider {
    public provideDocumentSymbols(document: vscode.TextDocument): vscode.SymbolInformation[] {
        const result: vscode.SymbolInformation[] = []

        if (document) {
            const data = utils.getDocumentArrayItems(document.getText())

            if (data) {
                for (const item of data) {
                    result.push(...getSymbolsList(document, [item]))
                }
            }
        }

        return result
    }

    public getSymbolKeys(document: vscode.TextDocument): string[] {
        return this.provideDocumentSymbols(document).map(getSymbolKey)
    }

    public getSymbolKeyAtLine(document: vscode.TextDocument, line: number): string | undefined {
        const symbol = this.provideDocumentSymbols(document).find(({ location }) => location.range.start.line === line)

        return symbol && getSymbolKey(symbol)
    }
}

function getSymbolKey({ name, containerName }: vscode.SymbolInformation): string {
    return containerName ? `${containerName}.${name}` : name
}

function getSymbolsList(
    document: vscode.TextDocument,
    nodeList: Array<any>,
    ancestors: string[] = [],
): vscode.SymbolInformation[] {
    const result: vscode.SymbolInformation[] = []
    let nextImplicitKey = 0

    for (const node of nodeList) {
        if (!node?.value?.kind) {
            continue
        }

        const key = getValue(node, nextImplicitKey, document)
        const symbol = new vscode.SymbolInformation(
            key,
            getType(node),
            getNodeKeyRange(node, document),
            document.uri,
            ancestors.join('.'),
        )
        result.push(symbol)

        if (node.value.items?.length) {
            result.push(...getSymbolsList(document, node.value.items, [...ancestors, key]))
        }

        nextImplicitKey = getNextImplicitKey(node, nextImplicitKey)
    }

    return result
}

function getValue(node: any, implicitKey: number, document: vscode.TextDocument): string {
    const key = getExpressionValue(node.key, document) ?? getExpressionSource(node.key, document)

    return key
        ?? getExpressionValue(node.value, document)
        ?? getExpressionSource(node.value, document)
        ?? `${implicitKey}`
}

function getExpressionValue(expression: any, document: vscode.TextDocument): string | undefined {
    if (!expression) {
        return undefined
    }

    if (expression.value !== undefined) {
        return String(expression.value)
    }

    const memberValue = getMemberExpressionValue(expression, document)

    if (memberValue !== undefined) {
        return memberValue
    }

    if (expression.name !== undefined) {
        return String(expression.name)
    }

    if (expression.what) {
        return getExpressionValue(expression.what, document)
    }

    return undefined
}

function getExpressionSource(expression: any, document: vscode.TextDocument): string | undefined {
    return expression?.kind === 'array' ? undefined : getNodeText(expression, document)
}

function getMemberExpressionValue(expression: any, document: vscode.TextDocument): string | undefined {
    let separator: string | undefined

    switch (expression.kind) {
        case 'staticlookup':
            separator = '::'
            break
        case 'propertylookup':
            separator = '->'
            break
    }

    if (!separator || expression.offset?.name === undefined) {
        return undefined
    }

    const owner = getExpressionValue(expression.what, document)

    return owner === undefined ? undefined : `${owner}${separator}${expression.offset.name}`
}

function getNodeText(node: any, document: vscode.TextDocument): string | undefined {
    const location = node?.loc

    if (typeof location?.start?.offset === 'number' && typeof location?.end?.offset === 'number') {
        return document.getText().slice(location.start.offset, location.end.offset)
    }

    return undefined
}

function getNextImplicitKey(node: any, current: number): number {
    const key = node.key

    if (!key) {
        return current + 1
    }

    let nextKey: number | undefined

    if (key.kind === 'boolean') {
        nextKey = key.value ? 1 : 0
    } else if (key.kind === 'number') {
        nextKey = Number(key.value)
    } else if (key.kind === 'string' && /^(?:0|-[1-9]\d*|[1-9]\d*)$/.test(key.value)) {
        nextKey = Number(key.value)
    }

    return nextKey !== undefined && Number.isSafeInteger(nextKey)
        ? Math.max(current, nextKey + 1)
        : current
}

function getNodeKeyRange(node: any, document: vscode.TextDocument) {
    const location = node?.loc

    if (typeof location?.start?.offset === 'number' && typeof location?.end?.offset === 'number') {
        return new vscode.Range(
            document.positionAt(location.start.offset),
            document.positionAt(location.end.offset),
        )
    }

    return new vscode.Range(
        new vscode.Position(location.start.line - 1, location.start.column),
        new vscode.Position(location.end.line - 1, location.end.column),
    )
}

function getType(node: any) {
    switch (node.value.kind) {
        case 'array':
            return vscode.SymbolKind.Array
        case 'string':
            return vscode.SymbolKind.String
        case 'number':
            return vscode.SymbolKind.Number
        case 'boolean':
            return vscode.SymbolKind.Boolean
        case 'staticlookup':
        case 'name':
            return vscode.SymbolKind.Class
        case 'nullkeyword':
            return vscode.SymbolKind.Null
        case 'call':
            return vscode.SymbolKind.Function
        case 'bin':
            return vscode.SymbolKind.Package
        default:
            return vscode.SymbolKind.Key
    }
}
