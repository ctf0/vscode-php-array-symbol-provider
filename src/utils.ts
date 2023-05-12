import * as PhpParser from 'php-parser';

const parser = new PhpParser.Engine({
    ast: {
        withPositions: true,
    },
});

export function getDocumentArrayItems(content: string) {
    try {
        const AST = parser.parseCode(content, '*.php');

        if (AST) {
            return astToFlatArray(filterNeeded(AST.children));
        }
    } catch (error) {
        // console.error(error);
    }
}

function astToFlatArray(symbolsList) {
    const list: any = [];

    for (const item of symbolsList) {
        const kind = item.kind;
        const children = item.children;

        if (children) {
            list.push(...astToFlatArray(filterNeeded(children)));
        }

        if (!new RegExp(/namespace|expressionstatement/).test(kind)) {
            if (kind === 'class') {
                list.push(...astToFlatArray(filterNeeded(item.body)));
            }
            else if (kind === 'method') {
                list.push(...astToFlatArray(filterNeeded(item.body.children)));
            }
            else if (kind === 'return') {
                if (item.expr.kind === 'array') {
                    list.push(item);
                }
            }
            else {
                list.push(item);
            }
        }
    }

    return list;
}

function filterNeeded(ast) {
    return ast.filter((item) => !new RegExp(/declare|usegroup|traituse/).test(item.kind));
}
