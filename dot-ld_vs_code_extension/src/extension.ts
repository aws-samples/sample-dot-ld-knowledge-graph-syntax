import * as vscode from 'vscode';
import { GraphPanel } from './webview/GraphPanel';
import { DotldParser } from './parser/DotldParser';

/** Delay before re-evaluating DOT-LD notation while the user is typing. */
const CONTEXT_UPDATE_DEBOUNCE_MS = 300;

/**
 * DOT-LD notation lives inside regular Markdown documents. The extension
 * deliberately does NOT register its own language for `.md` so that the
 * built-in Markdown preview (and Markdown tooling in general) keeps working.
 */
function isMarkdownDocument(
    document: vscode.TextDocument | undefined
): document is vscode.TextDocument {
    if (!document) {
        return false;
    }
    return document.languageId === 'markdown' || document.fileName.endsWith('.md');
}

export function activate(context: vscode.ExtensionContext) {
    console.log('DOT-LD extension is now active');

    let contextUpdateTimer: ReturnType<typeof setTimeout> | undefined;

    /**
     * Drives the `dotld.hasNotation` context key, which gates the graph icon in
     * the editor title bar so it only appears on documents that actually
     * contain DOT-LD notation.
     */
    const updateContext = (editor: vscode.TextEditor | undefined) => {
        const document = editor?.document;
        const hasNotation = isMarkdownDocument(document) &&
                            DotldParser.hasDotldNotation(document.getText());
        vscode.commands.executeCommand('setContext', 'dotld.hasNotation', hasNotation);
    };

    const scheduleContextUpdate = (editor: vscode.TextEditor | undefined) => {
        if (contextUpdateTimer) {
            clearTimeout(contextUpdateTimer);
        }
        contextUpdateTimer = setTimeout(() => {
            contextUpdateTimer = undefined;
            updateContext(editor);
        }, CONTEXT_UPDATE_DEBOUNCE_MS);
    };

    // Seed the context key for whatever is already open.
    updateContext(vscode.window.activeTextEditor);

    // Register command to show graph visualization
    const showGraphCommand = vscode.commands.registerCommand('dotld.showGraph', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active editor');
            return;
        }

        if (!isMarkdownDocument(editor.document)) {
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

    // Re-evaluate the context key when the user switches editors
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(editor => {
            updateContext(editor);
        })
    );

    // Auto-update graph and context key when document changes
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(event => {
            const activeEditor = vscode.window.activeTextEditor;
            if (event.document !== activeEditor?.document) {
                return;
            }
            if (!isMarkdownDocument(event.document)) {
                return;
            }

            scheduleContextUpdate(activeEditor);

            if (GraphPanel.currentPanel) {
                GraphPanel.currentPanel.update(event.document.getText());
            }
        })
    );

    // Clean up the pending debounce timer on deactivation
    context.subscriptions.push({
        dispose: () => {
            if (contextUpdateTimer) {
                clearTimeout(contextUpdateTimer);
                contextUpdateTimer = undefined;
            }
        }
    });
}

export function deactivate() {
    // Nothing to clean up: all disposables are registered on the extension
    // context and are disposed automatically by VS Code.
}
