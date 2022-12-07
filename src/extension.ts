import * as vscode from 'vscode';
import SymbolProvider from './SymbolProvider';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.languages.registerDocumentSymbolProvider(['php'], new SymbolProvider())
    )
}

export function deactivate() { }
