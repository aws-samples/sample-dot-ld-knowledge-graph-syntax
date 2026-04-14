import * as vscode from 'vscode';
import { GraphPanel } from './webview/GraphPanel';
import { DotldParser } from './parser/DotldParser';

export function activate(context: vscode.ExtensionContext) {
    console.log('DOT-LD extension is now active');

    // Register command to show graph visualization
    const showGraphCommand = vscode.commands.registerCommand('dotld.showGraph', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active editor');
            return;
        }

        // Accept markdown, dotld, or any .md file
        const isMarkdownFile = editor.document.languageId === 'markdown' ||
                              editor.document.languageId === 'dotld' ||
                              editor.document.fileName.endsWith('.md');
        
        if (!isMarkdownFile) {
            vscode.window.showWarningMessage('DOT-LD works with Markdown (.md) files');
            return;
        }

        const content = editor.document.getText();
        
        // Check if DOT-LD notation is present
        if (!DotldParser.hasDotldNotation(content)) {
            vscode.window.showInformationMessage('No DOT-LD notation found in this document');
            return;
        }

        GraphPanel.createOrShow(context.extensionUri, content);
    });

    // Register command to refresh graph
    const refreshGraphCommand = vscode.commands.registerCommand('dotld.refreshGraph', () => {
        if (GraphPanel.currentPanel) {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                GraphPanel.currentPanel.update(editor.document.getText());
            }
        }
    });

    context.subscriptions.push(showGraphCommand, refreshGraphCommand);

    // Auto-update graph when document changes
    vscode.workspace.onDidChangeTextDocument(event => {
        if (GraphPanel.currentPanel &&
            event.document === vscode.window.activeTextEditor?.document) {
            const isMarkdownFile = event.document.languageId === 'markdown' ||
                                  event.document.languageId === 'dotld' ||
                                  event.document.fileName.endsWith('.md');
            if (isMarkdownFile) {
                GraphPanel.currentPanel.update(event.document.getText());
            }
        }
    });
}

export function deactivate() {}
