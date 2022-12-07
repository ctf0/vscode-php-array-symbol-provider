import * as PhpParser from 'php-parser';
import * as vscode from 'vscode';

const parser = new PhpParser.Engine({
    parser: {
        locations: true,
        extractDoc: false,
        php7: true
    },
    ast: {
        withPositions: true
    }
})

export function getDocumentArrayItems(content: string) {
    const AST = parser.parseCode(content, '*.php');
    const _return: any = AST.children.find((item: any) => item.kind == 'return')

    if (_return?.expr && _return.expr.kind == 'array') {
        return _return.expr.items
    }

    return []
}

export function locationToRange(location: any, key: any) {
    return new vscode.Range(
        new vscode.Position(location.start.line - 1, location.start.column),
        new vscode.Position(location.end.line - 1, parseInt(location.start.column + key.length + 2))
    )
}
