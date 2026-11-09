/**
 * Manages the graph visualization webview panel.
 *
 * Security model:
 * - The webview HTML is a fixed template. Document content never goes into the HTML;
 *   graph data is sent with postMessage and rendered with DOM APIs and textContent.
 * - A Content Security Policy allows only this extension's local scripts and styles
 *   (scripts must also carry a per-load nonce). Nothing loads from the network.
 * - localResourceRoots limits the webview to the media/ folder and the bundled Cytoscape build.
 */

import * as vscode from 'vscode';
import { randomBytes } from 'crypto';
import { DotldParser } from '../parser/DotldParser';
import { GraphData } from '../parser/types';

const LAYOUTS = ['cose', 'circle', 'grid', 'breadthfirst'] as const;
type LayoutName = typeof LAYOUTS[number];

/** Messages sent from the extension to the webview. */
type ToWebviewMessage = { type: 'graph'; data: GraphData; layout: LayoutName };

export class GraphPanel {
    public static currentPanel: GraphPanel | undefined;
    private static readonly viewType = 'dotldGraph';

    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private readonly _disposables: vscode.Disposable[] = [];
    private _ready = false;
    private _pending: ToWebviewMessage | undefined;

    public static createOrShow(extensionUri: vscode.Uri, content: string) {
        const column = vscode.ViewColumn.Beside;

        if (GraphPanel.currentPanel) {
            GraphPanel.currentPanel._panel.reveal(column);
            GraphPanel.currentPanel.update(content);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            GraphPanel.viewType,
            'DOT-LD Graph',
            column,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                // @secure_recommendation: Least privilege. The webview can read only these folders.
                localResourceRoots: GraphPanel.resourceRoots(extensionUri)
            }
        );

        GraphPanel.currentPanel = new GraphPanel(panel, extensionUri, content);
    }

    private static resourceRoots(extensionUri: vscode.Uri): vscode.Uri[] {
        return [
            vscode.Uri.joinPath(extensionUri, 'media'),
            vscode.Uri.joinPath(extensionUri, 'node_modules', 'cytoscape', 'dist')
        ];
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, content: string) {
        this._panel = panel;
        this._extensionUri = extensionUri;

        this._panel.webview.html = this._getHtml(this._panel.webview);

        this._panel.webview.onDidReceiveMessage(
            (message: unknown) => {
                if (typeof message === 'object' && message !== null && (message as { type?: unknown }).type === 'ready') {
                    this._ready = true;
                    if (this._pending) {
                        void this._panel.webview.postMessage(this._pending);
                        this._pending = undefined;
                    }
                }
            },
            null,
            this._disposables
        );

        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        this.update(content);
    }

    /**
     * Parse the document and send the graph to the webview.
     */
    public update(content: string) {
        const parsed = DotldParser.parse(content);
        const message: ToWebviewMessage = {
            type: 'graph',
            data: DotldParser.toGraphData(parsed),
            layout: GraphPanel.configuredLayout()
        };

        if (this._ready) {
            void this._panel.webview.postMessage(message);
        } else {
            // Keep only the latest graph until the webview script reports it is ready
            this._pending = message;
        }
    }

    public dispose() {
        GraphPanel.currentPanel = undefined;

        this._panel.dispose();

        while (this._disposables.length) {
            this._disposables.pop()?.dispose();
        }
    }

    /** Reads the dotld.graphLayout setting, falling back to cose for unknown values. */
    private static configuredLayout(): LayoutName {
        const value = vscode.workspace.getConfiguration('dotld').get<string>('graphLayout', 'cose');
        return (LAYOUTS as readonly string[]).includes(value) ? value as LayoutName : 'cose';
    }

    /**
     * Fixed HTML template. It contains no document data.
     */
    private _getHtml(webview: vscode.Webview): string {
        const nonce = randomBytes(16).toString('base64');
        const asUri = (...segments: string[]) =>
            webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, ...segments)).toString();

        const cytoscapeUri = asUri('node_modules', 'cytoscape', 'dist', 'cytoscape.min.js');
        const scriptUri = asUri('media', 'graph.js');
        const styleUri = asUri('media', 'graph.css');

        // @secure_recommendation: Restrictive CSP. default-src 'none'; scripts need the nonce and must come
        // from this extension; styles only from this extension, with no 'unsafe-inline' (styles set from
        // JavaScript through the CSSOM are not affected by style-src); images only as data: or blob: (PNG export).
        const csp = [
            "default-src 'none'",
            `script-src 'nonce-${nonce}' ${webview.cspSource}`,
            `style-src ${webview.cspSource}`,
            `img-src ${webview.cspSource} data: blob:`,
            `font-src ${webview.cspSource}`,
            "base-uri 'none'",
            "form-action 'none'"
        ].join('; ');

        const layoutOptions = LAYOUTS.map(name => {
            const label = { cose: 'Force-Directed', breadthfirst: 'Hierarchical', circle: 'Circular', grid: 'Grid' }[name];
            return `<option value="${name}">${label}</option>`;
        }).join('');

        return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy" content="${csp}">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>DOT-LD Graph</title>
<!-- Cytoscape skips injecting its own <style> element when an element with this id exists; graph.css provides the rule. -->
<link rel="stylesheet" id="__________cytoscape_stylesheet" href="${styleUri}">
</head>
<body>
<div class="search-container">
  <input type="text" id="searchInput" placeholder="Search nodes..." aria-label="Search nodes">
  <select id="layoutSelect" aria-label="Layout">${layoutOptions}</select>
</div>
<div id="cy"></div>
<div class="details-panel">
  <h3>Node Details</h3>
  <div id="nodeDetails"><p class="no-selection">Click a node to view details</p></div>

  <div class="path-finder">
    <h3>Path Finder</h3>
    <div class="path-selector">
      <div class="autocomplete-container">
        <input type="text" id="startSearch" class="dropdown-filter" placeholder="Start node (type to search)..." aria-label="Start node">
        <div id="startDropdown" class="autocomplete-dropdown"></div>
      </div>
      <div class="autocomplete-container">
        <input type="text" id="endSearch" class="dropdown-filter" placeholder="End node (type to search)..." aria-label="End node">
        <div id="endDropdown" class="autocomplete-dropdown"></div>
      </div>
      <button id="findPathBtn">Find Path</button>
      <button id="clearPathBtn" class="outline-btn">Clear Path</button>
    </div>
    <div id="pathResult"></div>
  </div>

  <div class="relationship-filter">
    <h3>Relationship Types
      <span class="filter-actions">
        <button id="selectAllRel">All</button>
        <button id="clearAllRel">None</button>
      </span>
    </h3>
    <input type="text" id="relationshipSearch" class="full-width" placeholder="Filter types..." aria-label="Filter relationship types">
    <div class="relationship-list" id="relationshipList"></div>
  </div>

  <div class="graph-analysis">
    <h3>Graph Analysis</h3>
    <div class="analysis-section">
      <h4>Community Detection</h4>
      <div class="analysis-buttons">
        <button id="clusterBtn">Find Clusters</button>
        <button id="clearClusterBtn" class="outline-btn">Clear Clusters</button>
      </div>
      <div id="clusterResult"></div>
    </div>
    <div class="analysis-section">
      <h4>Centrality Analysis</h4>
      <div class="analysis-buttons">
        <button id="degreeCentralBtn">Degree</button>
        <button id="betweenCentralBtn">Betweenness</button>
        <button id="closenessCentralBtn">Closeness</button>
        <button id="clearCentralBtn" class="outline-btn">Clear</button>
      </div>
      <div id="centralityResult"></div>
    </div>
    <div class="analysis-section">
      <h4>Link Prediction</h4>
      <button id="linkPredictBtn">Suggest Missing Links</button>
      <div id="linkResult"></div>
    </div>
  </div>

  <div class="controls">
    <h3>Graph Controls</h3>
    <button id="fitBtn">Fit Graph</button>
    <button id="exportBtn">Export PNG</button>
  </div>
</div>
<div class="info" id="graphInfo"></div>
<script nonce="${nonce}" src="${cytoscapeUri}"></script>
<script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
    }
}
