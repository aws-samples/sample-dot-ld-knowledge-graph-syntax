/**
 * Manages the graph visualization webview panel
 */

import * as vscode from 'vscode';
import { DotldParser } from '../parser/DotldParser';
import { GraphData } from '../parser/types';

export class GraphPanel {
    public static currentPanel: GraphPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];

    public static createOrShow(extensionUri: vscode.Uri, content: string) {
        const column = vscode.ViewColumn.Beside;

        if (GraphPanel.currentPanel) {
            GraphPanel.currentPanel._panel.reveal(column);
            GraphPanel.currentPanel.update(content);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'dotldGraph',
            'DOT-LD Graph',
            column,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [extensionUri]
            }
        );

        GraphPanel.currentPanel = new GraphPanel(panel, extensionUri, content);
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, content: string) {
        this._panel = panel;
        this._extensionUri = extensionUri;

        this.update(content);

        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    }

    public update(content: string) {
        const webview = this._panel.webview;
        this._panel.webview.html = this._getHtmlForWebview(webview, content);
    }

    public dispose() {
        GraphPanel.currentPanel = undefined;

        this._panel.dispose();

        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview, content: string): string {
        // Parse the document
        const parsed = DotldParser.parse(content);
        const graphData = DotldParser.toGraphData(parsed);

        // Build HTML using string concatenation
        return this._buildHtml(graphData);
    }

    private _buildHtml(graphData: GraphData): string {
        // Use string concatenation to build HTML
        let html = '<!DOCTYPE html>';
        html += '<html lang="en">';
        html += '<head>';
        html += '<meta charset="UTF-8">';
        html += '<meta name="viewport" content="width=device-width, initial-scale=1.0">';
        html += '<title>DOT-LD Graph</title>';
        html += '<script src="https://unpkg.com/cytoscape/dist/cytoscape.min.js"></script>';
        html += this._buildStyles();
        html += '</head>';
        html += '<body>';
        html += '<div class="search-container">';
        html += '<input type="text" id="searchInput" placeholder="Search nodes..." />';
        html += '<select id="layoutSelect">';
        html += '<option value="cose">Force-Directed</option>';
        html += '<option value="breadthfirst">Hierarchical</option>';
        html += '<option value="circle">Circular</option>';
        html += '<option value="grid">Grid</option>';
        html += '</select>';
        html += '</div>';
        html += '<div id="cy"></div>';
        html += '<div class="details-panel">';
        html += '<h3>Node Details</h3>';
        html += '<div id="nodeDetails">';
        html += '<p class="no-selection">Click a node to view details</p>';
        html += '</div>';
        
        // Path Finder Section
        html += '<div class="path-finder">';
        html += '<h3>Path Finder</h3>';
        html += '<div class="path-selector">';
        html += '<div class="autocomplete-container">';
        html += '<input type="text" id="startSearch" class="dropdown-filter" placeholder="Start node (type to search)..." />';
        html += '<div id="startDropdown" class="autocomplete-dropdown"></div>';
        html += '</div>';
        html += '<div class="autocomplete-container" style="margin-top: 8px;">';
        html += '<input type="text" id="endSearch" class="dropdown-filter" placeholder="End node (type to search)..." />';
        html += '<div id="endDropdown" class="autocomplete-dropdown"></div>';
        html += '</div>';
        html += '<button id="findPathBtn" style="width: 100%; margin-top: 8px;">Find Path</button>';
        html += '<button id="clearPathBtn" class="outline-btn" style="width: 100%; margin-top: 4px;">Clear Path</button>';
        html += '</div>';
        html += '<div id="pathResult"></div>';
        html += '</div>';
        
        // Relationship Filter Section
        html += '<div class="relationship-filter">';
        html += '<h3>';
        html += 'Relationship Types';
        html += '<div class="filter-actions">';
        html += '<button id="selectAllRel">All</button>';
        html += '<button id="clearAllRel">None</button>';
        html += '</div>';
        html += '</h3>';
        html += '<input type="text" id="relationshipSearch" placeholder="Filter types..." style="width: 100%; margin-bottom: 8px; box-sizing: border-box;" />';
        html += '<div class="relationship-list" id="relationshipList"></div>';
        html += '</div>';
        
        // Graph Analysis Section
        html += '<div class="graph-analysis">';
        html += '<h3>Graph Analysis</h3>';
        html += '<div class="analysis-section">';
        html += '<h4>Community Detection</h4>';
        html += '<div class="analysis-buttons">';
        html += '<button id="clusterBtn">Find Clusters</button>';
        html += '<button id="clearClusterBtn" class="outline-btn">Clear Clusters</button>';
        html += '</div>';
        html += '<div id="clusterResult"></div>';
        html += '</div>';
        html += '<div class="analysis-section">';
        html += '<h4>Centrality Analysis</h4>';
        html += '<div class="analysis-buttons">';
        html += '<button id="degreeCentralBtn">Degree</button>';
        html += '<button id="betweenCentralBtn">Betweenness</button>';
        html += '<button id="closenessCentralBtn">Closeness</button>';
        html += '<button id="clearCentralBtn" class="outline-btn">Clear</button>';
        html += '</div>';
        html += '<div id="centralityResult"></div>';
        html += '</div>';
        html += '<div class="analysis-section">';
        html += '<h4>Link Prediction</h4>';
        html += '<button id="linkPredictBtn" style="width: 100%;">Suggest Missing Links</button>';
        html += '<div id="linkResult"></div>';
        html += '</div>';
        html += '</div>';
        
        html += '<div class="controls">';
        html += '<h3 style="margin: 0 0 10px 0; font-size: 13px;">Graph Controls</h3>';
        html += '<button id="fitBtn">Fit Graph</button>';
        html += '<button id="exportBtn">Export PNG</button>';
        html += '</div>';
        html += '</div>';
        html += '<div class="info">';
        html += 'Nodes: ' + graphData.nodes.length + ' | Edges: ' + graphData.edges.length;
        html += '</div>';
        html += this._buildScript(graphData);
        html += '</body>';
        html += '</html>';

        return html;
    }

    private _buildStyles(): string {
        let css = '<style>';
        css += '* { box-sizing: border-box; }';
        css += 'body { margin: 0; padding: 0; overflow: hidden; ';
        css += 'background: var(--vscode-editor-background); ';
        css += 'color: var(--vscode-editor-foreground); ';
        css += 'font-family: Arial, Helvetica, sans-serif; }';
        
        css += '#cy { width: calc(100vw - 250px); height: 100vh; ';
        css += 'background: var(--vscode-editor-background); }';
        
        css += '.search-container { position: absolute; top: 10px; left: 10px; ';
        css += 'z-index: 1000; display: flex; gap: 8px; align-items: center; }';
        
        css += 'input, select { background: var(--vscode-input-background); ';
        css += 'color: var(--vscode-input-foreground); ';
        css += 'border: 1px solid var(--vscode-input-border); ';
        css += 'padding: 6px 10px; border-radius: 2px; font-size: 12px; }';
        
        css += 'input:focus, select:focus { outline: 1px solid var(--vscode-focusBorder); }';
        
        css += 'button { background: var(--vscode-button-background); ';
        css += 'color: var(--vscode-button-foreground); border: none; ';
        css += 'padding: 8px 12px; cursor: pointer; border-radius: 2px; ';
        css += 'font-size: 12px; white-space: nowrap; width: 100%; }';
        
        css += 'button:hover { background: var(--vscode-button-hoverBackground); }';
        
        css += '.outline-btn { background: transparent; ';
        css += 'border: 1px solid var(--vscode-button-background); ';
        css += 'color: var(--vscode-button-background); }';
        
        css += '.outline-btn:hover { background: var(--vscode-button-background); ';
        css += 'color: var(--vscode-button-foreground); }';
        
        css += '.info { position: absolute; bottom: 10px; left: 10px; ';
        css += 'background: var(--vscode-editor-background); padding: 8px 12px; ';
        css += 'border-radius: 4px; font-size: 11px; opacity: 0.8; ';
        css += 'border: 1px solid var(--vscode-panel-border); }';
        
        css += '.details-panel { position: absolute; top: 0; right: 0; ';
        css += 'width: 250px; height: 100vh; ';
        css += 'background: var(--vscode-sideBar-background); ';
        css += 'border-left: 1px solid var(--vscode-panel-border); ';
        css += 'overflow-y: auto; padding: 15px; font-size: 13px; }';
        
        css += '.details-panel h3 { margin: 0 0 15px 0; font-size: 14px; ';
        css += 'color: var(--vscode-editor-foreground); ';
        css += 'border-bottom: 1px solid var(--vscode-panel-border); padding-bottom: 8px; }';
        
        css += '.no-selection { color: var(--vscode-descriptionForeground); font-style: italic; }';
        
        css += '.details-section { margin-bottom: 20px; }';
        
        css += '.details-label { font-weight: bold; ';
        css += 'color: var(--vscode-editor-foreground); margin-bottom: 5px; }';
        
        css += '.details-value { color: var(--vscode-descriptionForeground); margin-bottom: 10px; }';
        
        css += '.node-type-badge { display: inline-block; padding: 2px 8px; ';
        css += 'border-radius: 3px; font-size: 11px; font-weight: bold; }';
        
        css += '.connection-list { list-style: none; padding: 0; margin: 5px 0; }';
        
        css += '.connection-list li { padding: 4px 0; ';
        css += 'color: var(--vscode-descriptionForeground); cursor: pointer; }';
        
        css += '.connection-list li:hover { color: var(--vscode-textLink-foreground); }';
        
        css += '.controls { margin-top: 20px; padding-top: 15px; ';
        css += 'border-top: 1px solid var(--vscode-panel-border); ';
        css += 'display: flex; flex-direction: column; gap: 8px; }';
        
        // Path Finder styles
        css += '.path-finder { margin-top: 20px; padding-top: 15px; ';
        css += 'border-top: 1px solid var(--vscode-panel-border); }';
        
        css += '.path-selector { display: flex; flex-direction: column; gap: 8px; margin-bottom: 10px; }';
        
        css += '.dropdown-filter { font-size: 11px; margin-bottom: 3px; box-sizing: border-box; width: 100%; }';
        
        css += '.autocomplete-container { position: relative; width: 100%; }';
        
        css += '.autocomplete-container input { box-sizing: border-box; width: 100%; }';
        
        css += '.autocomplete-dropdown { position: absolute; top: 100%; left: 0; right: 0; ';
        css += 'max-height: 200px; overflow-y: auto; ';
        css += 'background: var(--vscode-dropdown-background); ';
        css += 'border: 1px solid var(--vscode-input-border); border-top: none; ';
        css += 'z-index: 1000; display: none; }';
        
        css += '.autocomplete-dropdown.show { display: block; }';
        
        css += '.autocomplete-item { padding: 6px 10px; cursor: pointer; font-size: 11px; }';
        
        css += '.autocomplete-item:hover { background: var(--vscode-list-hoverBackground); }';
        
        css += '.autocomplete-item.selected { background: var(--vscode-list-activeSelectionBackground); ';
        css += 'color: var(--vscode-list-activeSelectionForeground); }';
        
        css += '.autocomplete-item .match { font-weight: bold; ';
        css += 'color: var(--vscode-textLink-activeForeground); }';
        
        css += '.path-result { margin-top: 10px; padding: 8px; ';
        css += 'background: var(--vscode-textBlockQuote-background); ';
        css += 'border-radius: 3px; font-size: 11px; }';
        
        css += '.path-result .path-length { font-weight: bold; ';
        css += 'color: var(--vscode-textLink-foreground); }';
        
        css += '.path-result .path-steps { margin-top: 5px; font-family: monospace; ';
        css += 'font-size: 10px; line-height: 1.6; }';
        
        // Cytoscape styles for path highlighting
        css += 'node.path-highlight { }';
        css += 'edge.path-highlight { }';
        
        // Relationship Filter styles
        css += '.relationship-filter { margin-top: 20px; padding-top: 15px; ';
        css += 'border-top: 1px solid var(--vscode-panel-border); }';
        
        css += '.relationship-filter h3 { margin: 0 0 10px 0; font-size: 13px; ';
        css += 'display: flex; justify-content: space-between; align-items: center; }';
        
        css += '.filter-actions { display: flex; gap: 5px; }';
        
        css += '.filter-actions button { font-size: 10px; padding: 3px 8px; width: auto; }';
        
        css += '.relationship-list { max-height: 200px; overflow-y: auto; margin-bottom: 10px; }';
        
        css += '.relationship-item { display: flex; align-items: center; padding: 5px 0; ';
        css += 'cursor: pointer; user-select: none; }';
        
        css += '.relationship-item:hover { background: var(--vscode-list-hoverBackground); ';
        css += 'margin: 0 -5px; padding: 5px; }';
        
        css += '.relationship-item input[type="checkbox"] { margin-right: 8px; cursor: pointer; }';
        
        css += '.relationship-label { flex: 1; font-size: 11px; }';
        
        css += '.relationship-label .match { font-weight: bold; ';
        css += 'color: var(--vscode-textLink-activeForeground); }';
        
        css += '.relationship-count { font-size: 10px; ';
        css += 'color: var(--vscode-descriptionForeground); ';
        css += 'background: var(--vscode-badge-background); ';
        css += 'padding: 2px 6px; border-radius: 10px; margin-left: 5px; }';
        
        // Graph Analysis styles
        css += '.graph-analysis { margin-top: 20px; padding-top: 15px; ';
        css += 'border-top: 1px solid var(--vscode-panel-border); }';
        
        css += '.graph-analysis h3 { margin: 0 0 10px 0; font-size: 13px; }';
        
        css += '.analysis-section { margin-bottom: 15px; }';
        
        css += '.analysis-section h4 { font-size: 12px; margin: 0 0 8px 0; ';
        css += 'color: var(--vscode-editor-foreground); }';
        
        css += '.analysis-buttons { display: flex; flex-direction: column; gap: 5px; }';
        
        css += '.analysis-buttons button { width: 100%; font-size: 11px; padding: 6px 10px; }';
        
        css += '.analysis-result { margin-top: 8px; padding: 8px; ';
        css += 'background: var(--vscode-textBlockQuote-background); ';
        css += 'border-radius: 3px; font-size: 11px; }';
        
        css += '.analysis-result .metric { display: flex; justify-content: space-between; margin-bottom: 5px; }';
        
        css += '.analysis-result .metric-label { color: var(--vscode-descriptionForeground); }';
        
        css += '.analysis-result .metric-value { font-weight: bold; ';
        css += 'color: var(--vscode-textLink-foreground); }';
        
        css += '.cluster-badge { display: inline-block; width: 12px; height: 12px; ';
        css += 'border-radius: 50%; margin-right: 5px; }';
        
        css += '.centrality-node-link { cursor: pointer; margin-bottom: 4px; }';
        
        css += '.centrality-node-link:hover { color: var(--vscode-textLink-foreground); }';
        
        // Enhanced Cluster styles
        css += '.cluster-results { margin-top: 8px; }';
        
        css += '.cluster-header { display: flex; justify-content: space-between; ';
        css += 'align-items: center; margin-bottom: 10px; font-weight: bold; font-size: 11px; }';
        
        css += '.small-btn { font-size: 9px; padding: 2px 6px; width: auto; }';
        
        css += '.cluster-result-item { display: flex; align-items: center; padding: 6px 0; gap: 8px; }';
        
        css += '.cluster-checkbox { cursor: pointer; margin: 0; }';
        
        css += '.cluster-name { flex: 1; font-size: 11px; }';
        
        css += '.cluster-focus-btn { font-size: 9px; padding: 2px 6px; width: auto; }';
        
        css += '.cluster-metrics { margin-left: 20px; padding: 6px; ';
        css += 'background: var(--vscode-textBlockQuote-background); ';
        css += 'border-radius: 3px; margin-bottom: 8px; font-size: 10px; }';
        
        css += '.metric-row { display: flex; justify-content: space-between; padding: 2px 0; }';
        
        css += '</style>';
        return css;
    }

    private _buildScript(graphData: GraphData): string {
        // Build JavaScript using string concatenation
        let script = '<script>';
        
        // Embed graph data as JSON
        script += 'const graphData = ' + JSON.stringify(graphData) + ';';
        script += 'let cy;';
        
        // Initialize graph function
        script += 'function initGraph() {';
        script += '  const elements = [];';
        
        // Add nodes
        script += '  graphData.nodes.forEach(function(node) {';
        script += '    elements.push({';
        script += '      data: { id: node.id, label: node.label, type: node.type }';
        script += '    });';
        script += '  });';
        
        // Add edges
        script += '  graphData.edges.forEach(function(edge, index) {';
        script += '    elements.push({';
        script += '      data: {';
        script += '        id: "edge" + index,';
        script += '        source: edge.source,';
        script += '        target: edge.target,';
        script += '        label: edge.label';
        script += '      }';
        script += '    });';
        script += '  });';
        
        // Build style rules for node types
        script += '  const nodeStyleRules = [];';
        script += '  graphData.nodeStyles.forEach(function(style) {';
        script += '    nodeStyleRules.push({';
        script += '      selector: "node[type=\\"" + style.type + "\\"]",';
        script += '      style: {';
        script += '        "background-color": "white",';
        script += '        "border-width": "2px",';
        script += '        "border-color": style.color,';
        script += '        "shape": style.shape,';
        script += '        "width": style.size + "px",';
        script += '        "height": (style.size * 0.6) + "px"';
        script += '      }';
        script += '    });';
        script += '  });';
        
        // Initialize Cytoscape
        script += '  cy = cytoscape({';
        script += '    container: document.getElementById("cy"),';
        script += '    elements: elements,';
        script += '    style: [';
        script += '      {';
        script += '        selector: "node",';
        script += '        style: {';
        script += '          "label": "data(label)",';
        script += '          "text-valign": "center",';
        script += '          "text-halign": "center",';
        script += '          "background-color": "white",';
        script += '          "border-width": "2px",';
        script += '          "border-color": "#666",';
        script += '          "color": "#333",';
        script += '          "font-size": "12px",';
        script += '          "font-family": "Arial, Helvetica, sans-serif",';
        script += '          "font-weight": "normal",';
        script += '          "width": "100px",';
        script += '          "height": "60px",';
        script += '          "shape": "round-rectangle",';
        script += '          "text-wrap": "wrap",';
        script += '          "text-max-width": "90px"';
        script += '        }';
        script += '      },';
        script += '      ...nodeStyleRules,';
        script += '      {';
        script += '        selector: "edge",';
        script += '        style: {';
        script += '          "width": 2,';
        script += '          "line-color": "#999",';
        script += '          "target-arrow-color": "#999",';
        script += '          "target-arrow-shape": "triangle",';
        script += '          "curve-style": "bezier",';
        script += '          "label": "data(label)",';
        script += '          "font-size": "11px",';
        script += '          "font-family": "Arial, Helvetica, sans-serif",';
        script += '          "text-background-color": "#ffffff",';
        script += '          "text-background-opacity": 0.9,';
        script += '          "text-background-padding": "3px",';
        script += '          "color": "#666"';
        script += '        }';
        script += '      },';
        script += '      {';
        script += '        selector: ".highlighted",';
        script += '        style: {';
        script += '          "background-color": "#ffeb3b",';
        script += '          "border-width": "3px",';
        script += '          "border-color": "#f9a825",';
        script += '          "z-index": 999';
        script += '        }';
        script += '      },';
        script += '      {';
        script += '        selector: ".dimmed",';
        script += '        style: { "opacity": 0.2 }';
        script += '      },';
        script += '      {';
        script += '        selector: "node.path-highlight",';
        script += '        style: {';
        script += '          "background-color": "#ff9800",';
        script += '          "border-width": "4px",';
        script += '          "border-color": "#f57c00",';
        script += '          "z-index": 998';
        script += '        }';
        script += '      },';
        script += '      {';
        script += '        selector: "edge.path-highlight",';
        script += '        style: {';
        script += '          "line-color": "#ff9800",';
        script += '          "target-arrow-color": "#ff9800",';
        script += '          "width": 4,';
        script += '          "z-index": 998';
        script += '        }';
        script += '      },';
        script += '      {';
        script += '        selector: "edge.intra-cluster-edge",';
        script += '        style: {';
        script += '          "opacity": 1.0,';
        script += '          "width": 3';
        script += '        }';
        script += '      },';
        script += '      {';
        script += '        selector: "edge.inter-cluster-edge",';
        script += '        style: {';
        script += '          "opacity": 0.3,';
        script += '          "width": 1,';
        script += '          "line-style": "dashed"';
        script += '        }';
        script += '      }';
        script += '    ],';
        script += '    layout: {';
        script += '      name: "cose",';
        script += '      padding: 30,';
        script += '      nodeRepulsion: 8000,';
        script += '      idealEdgeLength: 120,';
        script += '      edgeElasticity: 200,';
        script += '      animate: false';
        script += '    }';
        script += '  });';
        
        // Add node click handler
        script += '  cy.on("tap", "node", function(evt) {';
        script += '    const node = evt.target;';
        script += '    showNodeDetails(node);';
        script += '    cy.nodes().removeClass("highlighted").addClass("dimmed");';
        script += '    cy.edges().removeClass("highlighted").addClass("dimmed");';
        script += '    node.removeClass("dimmed").addClass("highlighted");';
        script += '    node.connectedEdges().removeClass("dimmed").addClass("highlighted");';
        script += '    node.connectedEdges().connectedNodes().removeClass("dimmed");';
        script += '  });';
        
        // Clear selection on background click
        script += '  cy.on("tap", function(evt) {';
        script += '    if (evt.target === cy) {';
        script += '      document.getElementById("nodeDetails").innerHTML = ';
        script += '        "<p class=\\"no-selection\\">Click a node to view details</p>";';
        script += '      cy.elements().removeClass("highlighted dimmed path-highlight");';
        script += '      document.getElementById("pathResult").innerHTML = "";';
        script += '    }';
        script += '  });';
        
        script += '  cy.fit();';
        script += '}';
        
        // Show node details function
        script += 'function showNodeDetails(node) {';
        script += '  const nodeData = node.data();';
        script += '  const nodeType = nodeData.type;';
        script += '  const style = graphData.nodeStyles.find(function(s) { return s.type === nodeType; });';
        script += '  const color = style ? style.color : "#666";';
        script += '  let html = "";';
        script += '  html += "<div class=\\"details-section\\">";';
        script += '  html += "<div class=\\"details-label\\">Node Name</div>";';
        script += '  html += "<div class=\\"details-value\\">" + nodeData.label + "</div>";';
        script += '  html += "</div>";';
        script += '  html += "<div class=\\"details-section\\">";';
        script += '  html += "<div class=\\"details-label\\">Type</div>";';
        script += '  html += "<div class=\\"details-value\\">";';
        script += '  html += "<span class=\\"node-type-badge\\" style=\\"background-color: " + color + "20; color: " + color + "; border: 1px solid " + color + ";\\">";';
        script += '  html += nodeType;';
        script += '  html += "</span></div></div>";';
        script += '  document.getElementById("nodeDetails").innerHTML = html;';
        script += '}';
        
        // Search function
        script += 'function searchNodes() {';
        script += '  const searchText = document.getElementById("searchInput").value.toLowerCase();';
        script += '  cy.elements().removeClass("highlighted dimmed");';
        script += '  if (!searchText) { cy.fit(); return; }';
        script += '  const matchingNodes = cy.nodes().filter(function(node) {';
        script += '    return node.data("label").toLowerCase().includes(searchText);';
        script += '  });';
        script += '  if (matchingNodes.length > 0) {';
        script += '    cy.nodes().addClass("dimmed");';
        script += '    cy.edges().addClass("dimmed");';
        script += '    matchingNodes.removeClass("dimmed").addClass("highlighted");';
        script += '    matchingNodes.connectedEdges().removeClass("dimmed").addClass("highlighted");';
        script += '    matchingNodes.connectedEdges().connectedNodes().removeClass("dimmed");';
        script += '    cy.fit(matchingNodes, 50);';
        script += '  }';
        script += '}';
        
        // Layout change function
        script += 'function changeLayout() {';
        script += '  const layoutName = document.getElementById("layoutSelect").value;';
        script += '  const layoutOptions = { name: layoutName, padding: 30, animate: true, animationDuration: 500 };';
        script += '  if (layoutName === "cose") {';
        script += '    layoutOptions.nodeRepulsion = 8000;';
        script += '    layoutOptions.idealEdgeLength = 120;';
        script += '    layoutOptions.edgeElasticity = 200;';
        script += '  } else if (layoutName === "breadthfirst") {';
        script += '    layoutOptions.directed = true;';
        script += '    layoutOptions.spacingFactor = 1.5;';
        script += '  }';
        script += '  cy.layout(layoutOptions).run();';
        script += '}';
        
        // Control functions
        script += 'function fitGraph() { if (cy) cy.fit(); }';
        script += 'function resetZoom() { if (cy) { cy.zoom(1); cy.center(); } }';
        script += 'function exportPNG() {';
        script += '  if (!cy) return;';
        script += '  const pngData = cy.png({ output: "blob", bg: "white", full: true, scale: 2 });';
        script += '  const url = URL.createObjectURL(pngData);';
        script += '  const link = document.createElement("a");';
        script += '  link.href = url;';
        script += '  link.download = "dotld-graph.png";';
        script += '  link.click();';
        script += '  URL.revokeObjectURL(url);';
        script += '}';
        
        // Path Finder - Store all nodes and selected nodes
        script += 'let allNodes = [];';
        script += 'let selectedStartNode = null;';
        script += 'let selectedEndNode = null;';
        
        // Autocomplete handler
        script += 'function handleAutocomplete(type) {';
        script += '  const input = document.getElementById(type + "Search");';
        script += '  const dropdown = document.getElementById(type + "Dropdown");';
        script += '  const searchText = input.value.toLowerCase();';
        script += '  dropdown.innerHTML = "";';
        script += '  if (!searchText) { dropdown.classList.remove("show"); return; }';
        script += '  const matches = allNodes.filter(function(node) {';
        script += '    return node.label.toLowerCase().includes(searchText);';
        script += '  });';
        script += '  if (matches.length === 0) { dropdown.classList.remove("show"); return; }';
        script += '  let dropdownHtml = "";';
        script += '  matches.forEach(function(node) {';
        script += '    const label = node.label;';
        script += '    const matchIndex = label.toLowerCase().indexOf(searchText);';
        script += '    const before = label.substring(0, matchIndex);';
        script += '    const match = label.substring(matchIndex, matchIndex + searchText.length);';
        script += '    const after = label.substring(matchIndex + searchText.length);';
        script += '    dropdownHtml += "<div class=\\"autocomplete-item\\" data-node-id=\\"" + node.id + "\\">";';
        script += '    dropdownHtml += before + "<span class=\\"match\\">" + match + "</span>" + after;';
        script += '    dropdownHtml += "</div>";';
        script += '  });';
        script += '  dropdown.innerHTML = dropdownHtml;';
        script += '  dropdown.classList.add("show");';
        script += '  dropdown.querySelectorAll(".autocomplete-item").forEach(function(item) {';
        script += '    item.addEventListener("click", function() {';
        script += '      selectNode(type, this.dataset.nodeId, this.textContent);';
        script += '    });';
        script += '  });';
        script += '}';
        
        // Select node from autocomplete
        script += 'function selectNode(type, nodeId, nodeLabel) {';
        script += '  if (type === "start") {';
        script += '    selectedStartNode = nodeId;';
        script += '    document.getElementById("startSearch").value = nodeLabel;';
        script += '    document.getElementById("startDropdown").classList.remove("show");';
        script += '  } else {';
        script += '    selectedEndNode = nodeId;';
        script += '    document.getElementById("endSearch").value = nodeLabel;';
        script += '    document.getElementById("endDropdown").classList.remove("show");';
        script += '  }';
        script += '}';
        
        // Find path function
        script += 'function findPath() {';
        script += '  if (!cy) return;';
        script += '  const resultDiv = document.getElementById("pathResult");';
        script += '  cy.elements().removeClass("highlighted path-highlight dimmed");';
        script += '  if (!selectedStartNode || !selectedEndNode) {';
        script += '    resultDiv.innerHTML = "<div class=\\"path-result\\">Please select both start and end nodes</div>";';
        script += '    return;';
        script += '  }';
        script += '  if (selectedStartNode === selectedEndNode) {';
        script += '    resultDiv.innerHTML = "<div class=\\"path-result\\">Start and end nodes are the same</div>";';
        script += '    return;';
        script += '  }';
        script += '  const startNode = cy.$("#" + selectedStartNode);';
        script += '  const endNode = cy.$("#" + selectedEndNode);';
        script += '  if (startNode.length === 0 || endNode.length === 0) {';
        script += '    resultDiv.innerHTML = "<div class=\\"path-result\\">Could not find selected nodes</div>";';
        script += '    return;';
        script += '  }';
        script += '  let path = cy.elements().aStar({ root: startNode, goal: endNode, directed: true });';
        script += '  if (!path.found) {';
        script += '    path = cy.elements().aStar({ root: startNode, goal: endNode, directed: false });';
        script += '  }';
        script += '  if (!path.found) {';
        script += '    resultDiv.innerHTML = "<div class=\\"path-result\\" style=\\"color: #f48771;\\">No path found between these nodes</div>";';
        script += '    return;';
        script += '  }';
        script += '  cy.nodes().addClass("dimmed");';
        script += '  cy.edges().addClass("dimmed");';
        script += '  path.path.forEach(function(ele) {';
        script += '    ele.removeClass("dimmed").addClass("path-highlight");';
        script += '  });';
        script += '  const pathNodes = [];';
        script += '  path.path.nodes().forEach(function(node) { pathNodes.push(node.data("label")); });';
        script += '  const pathLength = pathNodes.length - 1;';
        script += '  const pathSteps = pathNodes.map(function(node, index) {';
        script += '    return index === pathNodes.length - 1 ? node : node + " →";';
        script += '  }).join(" ");';
        script += '  resultDiv.innerHTML = "<div class=\\"path-result\\">" +';
        script += '    "<div class=\\"path-length\\">Path found: " + pathLength + " hop" + (pathLength !== 1 ? "s" : "") + "</div>" +';
        script += '    "<div class=\\"path-steps\\">" + pathSteps + "</div></div>";';
        script += '  cy.fit(path.path, 50);';
        script += '}';
        
        // Clear path function
        script += 'function clearPath() {';
        script += '  if (!cy) return;';
        script += '  cy.elements().removeClass("highlighted dimmed path-highlight");';
        script += '  document.getElementById("pathResult").innerHTML = "";';
        script += '  document.getElementById("startSearch").value = "";';
        script += '  document.getElementById("endSearch").value = "";';
        script += '  selectedStartNode = null;';
        script += '  selectedEndNode = null;';
        script += '}';
        
        // Relationship Filter - Store relationship types and selections
        script += 'let relationshipTypes = new Map();';
        script += 'let selectedRelationships = new Set();';
        script += 'let allRelationships = [];';
        
        // Populate relationship filter
        script += 'function populateRelationshipFilter() {';
        script += '  relationshipTypes.clear();';
        script += '  cy.edges().forEach(function(edge) {';
        script += '    const label = edge.data("label");';
        script += '    if (label) {';
        script += '      relationshipTypes.set(label, (relationshipTypes.get(label) || 0) + 1);';
        script += '    }';
        script += '  });';
        script += '  allRelationships = Array.from(relationshipTypes.entries()).sort(function(a, b) {';
        script += '    return b[1] - a[1];';
        script += '  });';
        script += '  relationshipTypes.forEach(function(count, type) {';
        script += '    selectedRelationships.add(type);';
        script += '  });';
        script += '  renderRelationshipList();';
        script += '}';
        
        // Render relationship list with optional filter
        script += 'function renderRelationshipList(filterText) {';
        script += '  filterText = filterText || "";';
        script += '  const filtered = filterText ? ';
        script += '    allRelationships.filter(function(entry) {';
        script += '      return entry[0].toLowerCase().includes(filterText.toLowerCase());';
        script += '    }) : allRelationships;';
        script += '  let listHtml = "";';
        script += '  filtered.forEach(function(entry) {';
        script += '    const type = entry[0];';
        script += '    const count = entry[1];';
        script += '    const checked = selectedRelationships.has(type) ? "checked" : "";';
        script += '    let displayLabel = type;';
        script += '    if (filterText) {';
        script += '      const searchLower = filterText.toLowerCase();';
        script += '      const typeLower = type.toLowerCase();';
        script += '      const matchIndex = typeLower.indexOf(searchLower);';
        script += '      if (matchIndex >= 0) {';
        script += '        const before = type.substring(0, matchIndex);';
        script += '        const match = type.substring(matchIndex, matchIndex + filterText.length);';
        script += '        const after = type.substring(matchIndex + filterText.length);';
        script += '        displayLabel = before + "<span class=\\"match\\">" + match + "</span>" + after;';
        script += '      }';
        script += '    }';
        script += '    listHtml += "<div class=\\"relationship-item\\" data-rel-type=\\"" + type + "\\">";';
        script += '    listHtml += "<input type=\\"checkbox\\" " + checked + " />";';
        script += '    listHtml += "<span class=\\"relationship-label\\">" + displayLabel + "</span>";';
        script += '    listHtml += "<span class=\\"relationship-count\\">" + count + "</span>";';
        script += '    listHtml += "</div>";';
        script += '  });';
        script += '  document.getElementById("relationshipList").innerHTML = listHtml || "<p class=\\"no-selection\\">No matches</p>";';
        script += '  document.querySelectorAll(".relationship-item").forEach(function(item) {';
        script += '    item.addEventListener("click", function() {';
        script += '      toggleRelationship(this.dataset.relType);';
        script += '    });';
        script += '  });';
        script += '}';
        
        // Filter relationship list
        script += 'function filterRelationshipList() {';
        script += '  const searchText = document.getElementById("relationshipSearch").value;';
        script += '  renderRelationshipList(searchText);';
        script += '}';
        
        // Toggle relationship
        script += 'function toggleRelationship(type) {';
        script += '  if (selectedRelationships.has(type)) {';
        script += '    selectedRelationships.delete(type);';
        script += '  } else {';
        script += '    selectedRelationships.add(type);';
        script += '  }';
        script += '  renderRelationshipList(document.getElementById("relationshipSearch").value);';
        script += '  applyRelationshipFilter();';
        script += '}';
        
        // Select all relationships
        script += 'function selectAllRelationships() {';
        script += '  relationshipTypes.forEach(function(count, type) {';
        script += '    selectedRelationships.add(type);';
        script += '  });';
        script += '  renderRelationshipList(document.getElementById("relationshipSearch").value);';
        script += '  applyRelationshipFilter();';
        script += '}';
        
        // Clear all relationships
        script += 'function clearAllRelationships() {';
        script += '  selectedRelationships.clear();';
        script += '  renderRelationshipList(document.getElementById("relationshipSearch").value);';
        script += '  applyRelationshipFilter();';
        script += '}';
        
        // Apply relationship filter
        script += 'function applyRelationshipFilter() {';
        script += '  if (selectedRelationships.size === relationshipTypes.size) {';
        script += '    cy.elements().removeClass("dimmed");';
        script += '    cy.edges().style("label", "data(label)");';
        script += '    return;';
        script += '  }';
        script += '  if (selectedRelationships.size === 0) {';
        script += '    cy.nodes().addClass("dimmed");';
        script += '    cy.edges().addClass("dimmed");';
        script += '    cy.edges().style("label", "");';
        script += '    return;';
        script += '  }';
        script += '  cy.elements().addClass("dimmed");';
        script += '  const selectedEdges = cy.edges().filter(function(edge) {';
        script += '    const label = edge.data("label");';
        script += '    return label && selectedRelationships.has(label);';
        script += '  });';
        script += '  selectedEdges.removeClass("dimmed");';
        script += '  selectedEdges.style("label", "data(label)");';
        script += '  selectedEdges.connectedNodes().removeClass("dimmed");';
        script += '  cy.edges().filter(function(edge) {';
        script += '    const label = edge.data("label");';
        script += '    return !label || !selectedRelationships.has(label);';
        script += '  }).style("label", "");';
        script += '}';
        
        // GRAPH ANALYSIS FUNCTIONS
        
        // Cluster colors for community detection
        script += 'const clusterColors = [';
        script += '  "#2196F3", "#4CAF50", "#FF9800", "#E91E63", "#9C27B0",';
        script += '  "#00BCD4", "#8BC34A", "#FF5722", "#673AB7", "#009688"';
        script += '];';
        
        // Cluster data storage
        script += 'let clusterData = [];';
        script += 'let selectedClusters = new Set();';
        
        // Helper: Generate cluster name
        script += 'function generateClusterName(clusterNodes) {';
        script += '  const typeCounts = new Map();';
        script += '  clusterNodes.forEach(function(node) {';
        script += '    const type = node.data("type");';
        script += '    if (type && type !== "default") {';
        script += '      typeCounts.set(type, (typeCounts.get(type) || 0) + 1);';
        script += '    }';
        script += '  });';
        script += '  let mostCommonType = null;';
        script += '  let maxCount = 0;';
        script += '  typeCounts.forEach(function(count, type) {';
        script += '    if (count > maxCount) {';
        script += '      maxCount = count;';
        script += '      mostCommonType = type;';
        script += '    }';
        script += '  });';
        script += '  if (mostCommonType && maxCount >= 2) {';
        script += '    return mostCommonType.charAt(0).toUpperCase() + mostCommonType.slice(1);';
        script += '  }';
        script += '  let maxDegree = 0;';
        script += '  let centralNode = clusterNodes[0];';
        script += '  clusterNodes.forEach(function(node) {';
        script += '    const degree = node.degree();';
        script += '    if (degree > maxDegree) {';
        script += '      maxDegree = degree;';
        script += '      centralNode = node;';
        script += '    }';
        script += '  });';
        script += '  return centralNode.data("label");';
        script += '}';
        
        // Helper: Calculate cluster metrics
        script += 'function calculateClusterMetrics(clusterNodes, clusterId) {';
        script += '  const n = clusterNodes.length;';
        script += '  let internalEdges = 0;';
        script += '  let externalEdges = 0;';
        script += '  clusterNodes.forEach(function(node) {';
        script += '    node.connectedEdges().forEach(function(edge) {';
        script += '      const source = edge.source();';
        script += '      const target = edge.target();';
        script += '      const sourceInCluster = source.data("cluster") === clusterId;';
        script += '      const targetInCluster = target.data("cluster") === clusterId;';
        script += '      if (sourceInCluster && targetInCluster) {';
        script += '        internalEdges++;';
        script += '      } else if (sourceInCluster || targetInCluster) {';
        script += '        externalEdges++;';
        script += '      }';
        script += '    });';
        script += '  });';
        script += '  internalEdges = internalEdges / 2;';
        script += '  const possibleEdges = n * (n - 1) / 2;';
        script += '  const density = possibleEdges > 0 ? internalEdges / possibleEdges : 0;';
        script += '  const totalEdges = internalEdges + externalEdges;';
        script += '  const interClusterRatio = totalEdges > 0 ? externalEdges / totalEdges : 0;';
        script += '  const cohesion = density * (1 - interClusterRatio);';
        script += '  return {';
        script += '    density: density,';
        script += '    externalLinks: externalEdges,';
        script += '    cohesion: cohesion,';
        script += '    internalEdges: internalEdges';
        script += '  };';
        script += '}';
        
        // Community Detection (Label Propagation) - Enhanced
        script += 'function runClusterAnalysis() {';
        script += '  if (!cy) return;';
        script += '  cy.nodes().removeData("cluster");';
        script += '  cy.nodes().removeStyle("background-color border-color");';
        script += '  cy.elements().removeClass("dimmed");';
        script += '  const nodeToCommunity = new Map();';
        script += '  cy.nodes().forEach(function(node, i) {';
        script += '    nodeToCommunity.set(node.id(), i);';
        script += '  });';
        script += '  let improved = true;';
        script += '  let iterations = 0;';
        script += '  const maxIterations = 10;';
        script += '  while (improved && iterations < maxIterations) {';
        script += '    improved = false;';
        script += '    iterations++;';
        script += '    cy.nodes().forEach(function(node) {';
        script += '      const communityCount = new Map();';
        script += '      node.neighborhood("node").forEach(function(neighbor) {';
        script += '        const comm = nodeToCommunity.get(neighbor.id());';
        script += '        communityCount.set(comm, (communityCount.get(comm) || 0) + 1);';
        script += '      });';
        script += '      if (communityCount.size > 0) {';
        script += '        const bestComm = Array.from(communityCount.entries())';
        script += '          .sort(function(a, b) { return b[1] - a[1]; })[0][0];';
        script += '        if (nodeToCommunity.get(node.id()) !== bestComm) {';
        script += '          nodeToCommunity.set(node.id(), bestComm);';
        script += '          improved = true;';
        script += '        }';
        script += '      }';
        script += '    });';
        script += '  }';
        script += '  const communities = new Map();';
        script += '  nodeToCommunity.forEach(function(comm, nodeId) {';
        script += '    if (!communities.has(comm)) communities.set(comm, []);';
        script += '    communities.get(comm).push(cy.$("#" + nodeId));';
        script += '  });';
        script += '  let clusters = Array.from(communities.values())';
        script += '    .filter(function(cluster) { return cluster.length > 1; })';
        script += '    .sort(function(a, b) { return b.length - a.length; })';
        script += '    .slice(0, 6);';
        script += '  clusterData = [];';
        script += '  selectedClusters = new Set();';
        script += '  clusters.forEach(function(cluster, index) {';
        script += '    const color = clusterColors[index % clusterColors.length];';
        script += '    cluster.forEach(function(node) {';
        script += '      node.style("background-color", color);';
        script += '      node.style("border-color", color);';
        script += '      node.data("cluster", index);';
        script += '    });';
        script += '    const clusterName = generateClusterName(cluster);';
        script += '    const metrics = calculateClusterMetrics(cluster, index);';
        script += '    clusterData.push({';
        script += '      id: index,';
        script += '      nodes: cluster,';
        script += '      color: color,';
        script += '      name: clusterName,';
        script += '      metrics: metrics';
        script += '    });';
        script += '    selectedClusters.add(index);';
        script += '  });';
        script += '  highlightIntraClusterEdges();';
        script += '  cy.nodes().forEach(function(node) {';
        script += '    if (node.data("cluster") === undefined) {';
        script += '      node.addClass("dimmed");';
        script += '    }';
        script += '  });';
        script += '  cy.edges().forEach(function(edge) {';
        script += '    const source = edge.source();';
        script += '    const target = edge.target();';
        script += '    if (source.data("cluster") === undefined || target.data("cluster") === undefined) {';
        script += '      edge.addClass("dimmed");';
        script += '    }';
        script += '  });';
        script += '  let resultHtml = "<div class=\\"cluster-results\\">";';
        script += '  resultHtml += "<div class=\\"cluster-header\\">";';
        script += '  resultHtml += "<span>Clusters: " + clusters.length + "</span>";';
        script += '  resultHtml += "<div class=\\"filter-actions\\">";';
        script += '  resultHtml += "<button id=\\"selectAllClusters\\" class=\\"small-btn\\">All</button>";';
        script += '  resultHtml += "<button id=\\"deselectAllClusters\\" class=\\"small-btn\\">None</button>";';
        script += '  resultHtml += "</div></div>";';
        script += '  clusterData.forEach(function(cluster, i) {';
        script += '    resultHtml += "<div class=\\"cluster-result-item\\" data-cluster-id=\\"" + i + "\\">";';
        script += '    resultHtml += "<input type=\\"checkbox\\" checked class=\\"cluster-checkbox\\" />";';
        script += '    resultHtml += "<span class=\\"cluster-badge\\" style=\\"background: " + cluster.color + ";\\"></span>";';
        script += '    resultHtml += "<span class=\\"cluster-name\\">" + cluster.name + " (" + cluster.nodes.length + ")</span>";';
        script += '    resultHtml += "<button class=\\"cluster-focus-btn\\">Focus</button>";';
        script += '    resultHtml += "</div>";';
        script += '  });';
        script += '  resultHtml += "</div>";';
        script += '  document.getElementById("clusterResult").innerHTML = resultHtml;';
        script += '  document.querySelectorAll(".cluster-checkbox").forEach(function(checkbox) {';
        script += '    checkbox.addEventListener("change", function() {';
        script += '      const item = this.closest(".cluster-result-item");';
        script += '      toggleCluster(parseInt(item.dataset.clusterId));';
        script += '    });';
        script += '  });';
        script += '  document.querySelectorAll(".cluster-focus-btn").forEach(function(btn) {';
        script += '    btn.addEventListener("click", function() {';
        script += '      const item = this.closest(".cluster-result-item");';
        script += '      focusCluster(parseInt(item.dataset.clusterId));';
        script += '    });';
        script += '  });';
        script += '  const selectAllBtn = document.getElementById("selectAllClusters");';
        script += '  const deselectAllBtn = document.getElementById("deselectAllClusters");';
        script += '  if (selectAllBtn) selectAllBtn.addEventListener("click", selectAllClusters);';
        script += '  if (deselectAllBtn) deselectAllBtn.addEventListener("click", deselectAllClusters);';
        script += '}';
        
        // Clear clusters
        script += 'function clearClusters() {';
        script += '  if (!cy) return;';
        script += '  cy.nodes().removeStyle("background-color border-color width height opacity");';
        script += '  cy.nodes().removeData("cluster");';
        script += '  cy.elements().removeClass("dimmed highlighted path-highlight");';
        script += '  document.getElementById("clusterResult").innerHTML = "";';
        script += '  clusterData = [];';
        script += '  selectedClusters = new Set();';
        script += '  cy.edges().removeClass("intra-cluster-edge inter-cluster-edge");';
        script += '}';
        
        // Highlight intra-cluster edges
        script += 'function highlightIntraClusterEdges() {';
        script += '  cy.edges().forEach(function(edge) {';
        script += '    const source = edge.source();';
        script += '    const target = edge.target();';
        script += '    const sourceCluster = source.data("cluster");';
        script += '    const targetCluster = target.data("cluster");';
        script += '    if (sourceCluster !== undefined && sourceCluster === targetCluster) {';
        script += '      edge.addClass("intra-cluster-edge");';
        script += '      edge.removeClass("inter-cluster-edge");';
        script += '    } else if (sourceCluster !== undefined && targetCluster !== undefined) {';
        script += '      edge.addClass("inter-cluster-edge");';
        script += '      edge.removeClass("intra-cluster-edge");';
        script += '    }';
        script += '  });';
        script += '}';
        
        // Toggle cluster visibility
        script += 'function toggleCluster(clusterId) {';
        script += '  if (selectedClusters.has(clusterId)) {';
        script += '    selectedClusters.delete(clusterId);';
        script += '  } else {';
        script += '    selectedClusters.add(clusterId);';
        script += '  }';
        script += '  applyClusterFilter();';
        script += '}';
        
        // Apply cluster filter
        script += 'function applyClusterFilter() {';
        script += '  if (selectedClusters.size === clusterData.length) {';
        script += '    cy.elements().removeClass("dimmed");';
        script += '    cy.edges().removeClass("intra-cluster-edge inter-cluster-edge");';
        script += '    highlightIntraClusterEdges();';
        script += '    return;';
        script += '  }';
        script += '  if (selectedClusters.size === 0) {';
        script += '    cy.elements().removeClass("intra-cluster-edge inter-cluster-edge");';
        script += '    cy.nodes().addClass("dimmed");';
        script += '    cy.edges().addClass("dimmed");';
        script += '    return;';
        script += '  }';
        script += '  cy.nodes().forEach(function(node) {';
        script += '    const nodeCluster = node.data("cluster");';
        script += '    if (selectedClusters.has(nodeCluster)) {';
        script += '      node.removeClass("dimmed");';
        script += '    } else {';
        script += '      node.addClass("dimmed");';
        script += '    }';
        script += '  });';
        script += '  cy.edges().forEach(function(edge) {';
        script += '    const source = edge.source();';
        script += '    const target = edge.target();';
        script += '    const sourceCluster = source.data("cluster");';
        script += '    const targetCluster = target.data("cluster");';
        script += '    if (selectedClusters.has(sourceCluster) && selectedClusters.has(targetCluster)) {';
        script += '      edge.removeClass("dimmed");';
        script += '    } else {';
        script += '      edge.addClass("dimmed");';
        script += '    }';
        script += '  });';
        script += '}';
        
        // Select all clusters
        script += 'function selectAllClusters() {';
        script += '  clusterData.forEach(function(cluster) {';
        script += '    selectedClusters.add(cluster.id);';
        script += '  });';
        script += '  document.querySelectorAll(".cluster-checkbox").forEach(function(cb) {';
        script += '    cb.checked = true;';
        script += '  });';
        script += '  applyClusterFilter();';
        script += '}';
        
        // Deselect all clusters
        script += 'function deselectAllClusters() {';
        script += '  selectedClusters.clear();';
        script += '  document.querySelectorAll(".cluster-checkbox").forEach(function(cb) {';
        script += '    cb.checked = false;';
        script += '  });';
        script += '  applyClusterFilter();';
        script += '}';
        
        // Focus on cluster
        script += 'function focusCluster(clusterId) {';
        script += '  const cluster = clusterData[clusterId];';
        script += '  if (cluster && cluster.nodes) {';
        script += '    cy.fit(cy.collection(cluster.nodes), 50);';
        script += '  }';
        script += '}';
        
        // Centrality Analysis
        script += 'function runCentralityAnalysis(type) {';
        script += '  if (!cy) return;';
        script += '  clearClusters();';
        script += '  cy.elements().removeClass("dimmed");';
        script += '  let scores = {};';
        script += '  let algorithmName = "";';
        script += '  if (type === "degree") {';
        script += '    algorithmName = "Degree Centrality";';
        script += '    cy.nodes().forEach(function(node) {';
        script += '      scores[node.id()] = node.degree();';
        script += '    });';
        script += '  } else if (type === "betweenness") {';
        script += '    algorithmName = "Betweenness Centrality";';
        script += '    const bc = cy.elements().betweennessCentrality({ directed: false });';
        script += '    cy.nodes().forEach(function(node) {';
        script += '      scores[node.id()] = bc.betweenness(node);';
        script += '    });';
        script += '  } else if (type === "closeness") {';
        script += '    algorithmName = "Closeness Centrality";';
        script += '    cy.nodes().forEach(function(node) {';
        script += '      let totalDistance = 0;';
        script += '      let reachableNodes = 0;';
        script += '      cy.nodes().forEach(function(target) {';
        script += '        if (node.id() === target.id()) return;';
        script += '        const path = cy.elements().aStar({';
        script += '          root: node, goal: target, directed: false';
        script += '        });';
        script += '        if (path.found) {';
        script += '          totalDistance += path.distance;';
        script += '          reachableNodes++;';
        script += '        }';
        script += '      });';
        script += '      scores[node.id()] = reachableNodes > 0 ? reachableNodes / totalDistance : 0;';
        script += '    });';
        script += '  }';
        script += '  const values = Object.values(scores);';
        script += '  const minScore = Math.min.apply(null, values);';
        script += '  const maxScore = Math.max.apply(null, values);';
        script += '  cy.nodes().forEach(function(node) {';
        script += '    const score = scores[node.id()];';
        script += '    const normalized = maxScore > minScore ? (score - minScore) / (maxScore - minScore) : 0.5;';
        script += '    const baseSize = 100;';
        script += '    const newSize = baseSize + (normalized * 80);';
        script += '    node.style("width", newSize + "px");';
        script += '    node.style("height", (newSize * 0.6) + "px");';
        script += '    node.style("opacity", 0.4 + (normalized * 0.6));';
        script += '  });';
        script += '  const sorted = Object.entries(scores)';
        script += '    .sort(function(a, b) { return b[1] - a[1]; })';
        script += '    .slice(0, 5);';
        script += '  let resultHtml = "<div class=\\"analysis-result\\">";';
        script += '  resultHtml += "<div style=\\"margin-bottom: 8px; font-weight: bold;\\">" + algorithmName + "</div>";';
        script += '  resultHtml += "<div style=\\"font-size: 10px; color: var(--vscode-descriptionForeground); margin-bottom: 8px;\\">";';
        script += '  resultHtml += "Node size = centrality score</div>";';
        script += '  resultHtml += "<div style=\\"font-weight: bold; margin-bottom: 5px;\\">Top 5 Nodes:</div>";';
        script += '  sorted.forEach(function(entry, index) {';
        script += '    const nodeId = entry[0];';
        script += '    const score = entry[1];';
        script += '    const node = cy.$("#" + nodeId);';
        script += '    const label = node.data("label");';
        script += '    resultHtml += "<div class=\\"centrality-node-link\\" data-node-id=\\"" + nodeId + "\\">";';
        script += '    resultHtml += (index + 1) + ". " + label;';
        script += '    resultHtml += " <span style=\\"color: var(--vscode-descriptionForeground);\\">";';
        script += '    resultHtml += "(" + score.toFixed(2) + ")</span></div>";';
        script += '  });';
        script += '  resultHtml += "</div>";';
        script += '  document.getElementById("centralityResult").innerHTML = resultHtml;';
        script += '  document.querySelectorAll(".centrality-node-link").forEach(function(link) {';
        script += '    link.addEventListener("click", function() {';
        script += '      focusNode(this.dataset.nodeId);';
        script += '    });';
        script += '  });';
        script += '}';
        
        // Clear centrality
        script += 'function clearCentrality() {';
        script += '  if (!cy) return;';
        script += '  cy.nodes().removeStyle("width height opacity background-color border-color");';
        script += '  cy.elements().removeClass("dimmed highlighted path-highlight");';
        script += '  document.getElementById("centralityResult").innerHTML = "";';
        script += '}';
        
        // Focus on node (for centrality links)
        script += 'function focusNode(nodeId) {';
        script += '  if (!cy) return;';
        script += '  const node = cy.$("#" + nodeId);';
        script += '  if (node.length > 0) {';
        script += '    cy.animate({ center: { eles: node }, zoom: 1.5 }, { duration: 500 });';
        script += '    showNodeDetails(node);';
        script += '    cy.nodes().addClass("dimmed");';
        script += '    cy.edges().addClass("dimmed");';
        script += '    node.removeClass("dimmed").addClass("highlighted");';
        script += '    node.connectedEdges().removeClass("dimmed").addClass("highlighted");';
        script += '    node.connectedEdges().connectedNodes().removeClass("dimmed");';
        script += '  }';
        script += '}';
        
        // Link Prediction
        script += 'function suggestLinks() {';
        script += '  if (!cy) return;';
        script += '  clearClusters();';
        script += '  cy.elements().removeClass("dimmed");';
        script += '  const suggestions = [];';
        script += '  cy.nodes().forEach(function(node1) {';
        script += '    cy.nodes().forEach(function(node2) {';
        script += '      if (node1.id() >= node2.id()) return;';
        script += '      const existingEdge = node1.edgesWith(node2);';
        script += '      if (existingEdge.length > 0) return;';
        script += '      const neighbors1 = new Set();';
        script += '      node1.neighborhood("node").forEach(function(n) { neighbors1.add(n.id()); });';
        script += '      const neighbors2 = new Set();';
        script += '      node2.neighborhood("node").forEach(function(n) { neighbors2.add(n.id()); });';
        script += '      const intersection = Array.from(neighbors1).filter(function(x) {';
        script += '        return neighbors2.has(x);';
        script += '      }).length;';
        script += '      const union = new Set(Array.from(neighbors1).concat(Array.from(neighbors2))).size;';
        script += '      if (intersection > 0) {';
        script += '        const score = intersection / union;';
        script += '        suggestions.push({';
        script += '          source: node1.id(),';
        script += '          target: node2.id(),';
        script += '          sourceLabel: node1.data("label"),';
        script += '          targetLabel: node2.data("label"),';
        script += '          score: score,';
        script += '          commonNeighbors: intersection';
        script += '        });';
        script += '      }';
        script += '    });';
        script += '  });';
        script += '  const topSuggestions = suggestions';
        script += '    .sort(function(a, b) { return b.score - a.score; })';
        script += '    .slice(0, 10);';
        script += '  if (topSuggestions.length === 0) {';
        script += '    document.getElementById("linkResult").innerHTML =';
        script += '      "<div class=\\"analysis-result\\">No link suggestions found.</div>";';
        script += '    return;';
        script += '  }';
        script += '  let resultHtml = "<div class=\\"analysis-result\\">";';
        script += '  resultHtml += "<div style=\\"margin-bottom: 8px; font-weight: bold;\\">Suggested Links</div>";';
        script += '  resultHtml += "<div style=\\"font-size: 10px; color: var(--vscode-descriptionForeground); margin-bottom: 8px;\\">";';
        script += '  resultHtml += "Based on common neighbors</div>";';
        script += '  topSuggestions.forEach(function(sug, index) {';
        script += '    resultHtml += "<div style=\\"margin-bottom: 6px; font-size: 10px; line-height: 1.4;\\">";';
        script += '    resultHtml += (index + 1) + ". " + sug.sourceLabel + " → " + sug.targetLabel;';
        script += '    resultHtml += "<div style=\\"color: var(--vscode-descriptionForeground); margin-left: 12px;\\">";';
        script += '    resultHtml += sug.commonNeighbors + " common neighbor";';
        script += '    resultHtml += sug.commonNeighbors > 1 ? "s" : "";';
        script += '    resultHtml += "</div></div>";';
        script += '  });';
        script += '  resultHtml += "</div>";';
        script += '  document.getElementById("linkResult").innerHTML = resultHtml;';
        script += '}';
        
        // Initialize on load
        script += 'window.addEventListener("load", function() {';
        script += '  initGraph();';
        script += '  allNodes = cy.nodes().map(function(node) {';
        script += '    return { id: node.id(), label: node.data("label") };';
        script += '  }).sort(function(a, b) { return a.label.localeCompare(b.label); });';
        script += '  document.getElementById("searchInput").addEventListener("keyup", searchNodes);';
        script += '  document.getElementById("layoutSelect").addEventListener("change", changeLayout);';
        script += '  document.getElementById("fitBtn").addEventListener("click", fitGraph);';
        script += '  document.getElementById("exportBtn").addEventListener("click", exportPNG);';
        script += '  document.getElementById("startSearch").addEventListener("input", function() { handleAutocomplete("start"); });';
        script += '  document.getElementById("startSearch").addEventListener("focus", function() { handleAutocomplete("start"); });';
        script += '  document.getElementById("endSearch").addEventListener("input", function() { handleAutocomplete("end"); });';
        script += '  document.getElementById("endSearch").addEventListener("focus", function() { handleAutocomplete("end"); });';
        script += '  document.getElementById("findPathBtn").addEventListener("click", findPath);';
        script += '  document.getElementById("clearPathBtn").addEventListener("click", clearPath);';
        script += '  populateRelationshipFilter();';
        script += '  document.getElementById("relationshipSearch").addEventListener("input", filterRelationshipList);';
        script += '  document.getElementById("selectAllRel").addEventListener("click", selectAllRelationships);';
        script += '  document.getElementById("clearAllRel").addEventListener("click", clearAllRelationships);';
        script += '  document.getElementById("clusterBtn").addEventListener("click", runClusterAnalysis);';
        script += '  document.getElementById("clearClusterBtn").addEventListener("click", clearClusters);';
        script += '  document.getElementById("degreeCentralBtn").addEventListener("click", function() { runCentralityAnalysis("degree"); });';
        script += '  document.getElementById("betweenCentralBtn").addEventListener("click", function() { runCentralityAnalysis("betweenness"); });';
        script += '  document.getElementById("closenessCentralBtn").addEventListener("click", function() { runCentralityAnalysis("closeness"); });';
        script += '  document.getElementById("clearCentralBtn").addEventListener("click", clearCentrality);';
        script += '  document.getElementById("linkPredictBtn").addEventListener("click", suggestLinks);';
        script += '  document.addEventListener("click", function(e) {';
        script += '    if (!e.target.closest(".autocomplete-container")) {';
        script += '      document.querySelectorAll(".autocomplete-dropdown").forEach(function(dd) {';
        script += '        dd.classList.remove("show");';
        script += '      });';
        script += '    }';
        script += '  });';
        script += '});';
        
        script += '</script>';
        return script;
    }
}
