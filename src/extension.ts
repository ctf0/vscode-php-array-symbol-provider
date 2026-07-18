import * as vscode from 'vscode'
import SymbolProvider from './SymbolProvider'

export function activate(context: vscode.ExtensionContext) {
    const provider = new SymbolProvider()

    context.subscriptions.push(
        vscode.languages.registerDocumentSymbolProvider(['php'], provider),
    )

    return {
        getSymbolKeys       : provider.getSymbolKeys.bind(provider),
        getSymbolKeyAtLine  : provider.getSymbolKeyAtLine.bind(provider),
    }
}

export function deactivate() { }
