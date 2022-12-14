import * as PhpParser from 'php-parser';

const parser = new PhpParser.Engine({
    ast: {
        withPositions: true
    }
})

export function getDocumentArrayItems(content: string) {
    try {
        const AST = parser.parseCode(content, '*.php');
        const _return: any = AST.children.find((item: any) => item.kind == 'return')

        if (_return?.expr && _return.expr.kind == 'array') {
            return _return.expr.items
        }

        return []
    } catch (error) {
        // console.error(error);
    }
}
