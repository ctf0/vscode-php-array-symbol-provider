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

        if (!new RegExp(/namespace/).test(kind)) {
            // console.log(item);

            if (kind === 'class') {
                list.push(...astToFlatArray(filterNeeded(item.body)));
            }
            else if (isMethodOrFunction(kind)) {
                list.push(...astToFlatArray(filterNeeded(item.body.children)));
            }
            else if (kind === 'propertystatement') {
                list.push(...astToFlatArray(filterNeeded(item.properties)));
            }

            else if (kind === 'return') {
                if (isArray(item.expr.kind)) {
                    list.push(...item.expr.items);
                }
            }
            else if (kind === 'property') {
                if (isArray(item.value.kind)) {
                    list.push(...item.value.items);
                }
            }
            else if (kind === 'expressionstatement') {
                const exp = item.expression;

                if (isArray(exp.left.kind)) {
                    list.push(...exp.left.items);
                }

                if (isArray(exp.right.kind)) {
                    list.push(...exp.right.items);
                }
            }
            else {
                list.push(item);
            }
        }
    }

    return list;
}

function isArray(item) {
    return item === 'array';
}

function isMethodOrFunction(item) {
    return item === 'method' || item === 'function';
}

function filterNeeded(ast) {
    return ast.filter((item) => !new RegExp(/declare|usegroup|traituse/).test(item.kind));
}
