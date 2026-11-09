/*
 * DOT-LD graph webview script.
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 *
 * Security: all document-derived text (entity names, types, labels, property values) is written
 * with textContent or element attributes through the el() helper. Nothing is assigned to innerHTML.
 * Graph lookups use cy.getElementById() instead of building selector strings from names.
 */
(function () {
    'use strict';

    const vscode = acquireVsCodeApi();
    const $ = (id) => document.getElementById(id);

    // ---------------------------------------------------------------- DOM helpers

    /**
     * Create an element. Attribute values and text children are always set safely.
     * @param {string} tag - Element name
     * @param {Object} [props] - className, dataset, attributes (attrs), or event listeners (on)
     * @param {...(Node|string|number|null|undefined|false)} children - Nodes or text
     */
    function el(tag, props, ...children) {
        const node = document.createElement(tag);
        if (props) {
            if (props.className) { node.className = props.className; }
            if (props.text !== undefined) { node.textContent = String(props.text); }
            if (props.dataset) { Object.assign(node.dataset, props.dataset); }
            if (props.attrs) {
                for (const [key, value] of Object.entries(props.attrs)) {
                    if (value === true) { node.setAttribute(key, ''); }
                    else if (value !== false && value !== undefined && value !== null) { node.setAttribute(key, String(value)); }
                }
            }
            if (props.style) {
                // CSSOM property assignment (not a style attribute), so the CSP needs no 'unsafe-inline'
                for (const [key, value] of Object.entries(props.style)) { node.style.setProperty(key, value); }
            }
            if (props.on) {
                for (const [event, handler] of Object.entries(props.on)) { node.addEventListener(event, handler); }
            }
        }
        for (const child of children) {
            if (child === null || child === undefined || child === false) { continue; }
            node.append(child instanceof Node ? child : document.createTextNode(String(child)));
        }
        return node;
    }

    /** Replace the contents of a container with the given nodes. */
    function show(containerId, ...nodes) {
        $(containerId).replaceChildren(...nodes.filter(Boolean));
    }

    /**
     * Split text around the first case-insensitive match and wrap the match in a highlight span.
     * Returns text nodes and a span, never HTML.
     */
    function highlightMatch(text, query) {
        const index = query ? text.toLowerCase().indexOf(query.toLowerCase()) : -1;
        if (index < 0) { return [text]; }
        return [
            text.slice(0, index),
            el('span', { className: 'match', text: text.slice(index, index + query.length) }),
            text.slice(index + query.length)
        ];
    }

    /** Only #RRGGBB colors (validated by the parser) are used in styles; anything else falls back. */
    function safeColor(color, fallback) {
        return /^#[0-9A-Fa-f]{6}$/.test(color) ? color : fallback;
    }

    // ---------------------------------------------------------------- State

    let cy = null;
    let graphData = { nodes: [], edges: [], nodeStyles: [] };
    let allNodes = [];
    let selectedStartNode = null;
    let selectedEndNode = null;
    let currentLayout = 'cose';
    let hasLaidOut = false;

    const BASE_STYLE = [
        {
            selector: 'node',
            style: {
                'label': 'data(label)',
                'text-valign': 'center',
                'text-halign': 'center',
                'background-color': 'white',
                'border-width': '2px',
                'border-color': '#666',
                'color': '#333',
                'font-size': '12px',
                'font-family': 'Arial, Helvetica, sans-serif',
                'width': '100px',
                'height': '60px',
                'shape': 'round-rectangle',
                'text-wrap': 'wrap',
                'text-max-width': '90px'
            }
        },
        {
            selector: 'edge',
            style: {
                'width': 2,
                'line-color': '#999',
                'target-arrow-color': '#999',
                'source-arrow-color': '#999',
                'target-arrow-shape': 'triangle',
                'curve-style': 'bezier',
                'label': 'data(label)',
                'font-size': '11px',
                'font-family': 'Arial, Helvetica, sans-serif',
                'text-background-color': '#ffffff',
                'text-background-opacity': 0.9,
                'text-background-padding': '3px',
                'color': '#666'
            }
        },
        { selector: 'edge[?bidirectional]', style: { 'source-arrow-shape': 'triangle' } },
        { selector: 'node.highlighted', style: { 'background-color': '#ffeb3b', 'border-width': '3px', 'border-color': '#f9a825', 'z-index': 999 } },
        { selector: 'edge.highlighted', style: { 'line-color': '#f9a825', 'target-arrow-color': '#f9a825', 'source-arrow-color': '#f9a825', 'z-index': 999 } },
        { selector: '.dimmed', style: { 'opacity': 0.2 } },
        { selector: 'node.path-highlight', style: { 'background-color': '#ff9800', 'border-width': '4px', 'border-color': '#f57c00', 'z-index': 998 } },
        { selector: 'edge.path-highlight', style: { 'line-color': '#ff9800', 'target-arrow-color': '#ff9800', 'source-arrow-color': '#ff9800', 'width': 4, 'z-index': 998 } },
        { selector: 'edge.intra-cluster-edge', style: { 'opacity': 1.0, 'width': 3 } },
        { selector: 'edge.inter-cluster-edge', style: { 'opacity': 0.3, 'width': 1, 'line-style': 'dashed' } }
    ];

    // ---------------------------------------------------------------- Graph

    function buildStyle() {
        // Type names are validated by the parser (letters, digits, "_" and "-"), so they are safe in a selector
        const typeRules = graphData.nodeStyles
            .filter(style => /^[A-Za-z][\w-]*$/.test(style.type))
            .map(style => {
                const isCircle = style.shape === 'circle';
                return {
                    selector: `node[type="${style.type}"]`,
                    style: {
                        'border-color': safeColor(style.color, '#666666'),
                        'shape': isCircle ? 'ellipse' : style.shape,
                        'width': style.size + 'px',
                        'height': (isCircle ? style.size : style.size * 0.6) + 'px'
                    }
                };
            });
        return [BASE_STYLE[0], ...typeRules, ...BASE_STYLE.slice(1)];
    }

    function buildElements() {
        const elements = graphData.nodes.map(node => ({
            data: { id: node.id, label: node.label, type: node.type }
        }));
        graphData.edges.forEach((edge, index) => {
            elements.push({
                data: { id: 'edge' + index, source: edge.source, target: edge.target, label: edge.label, bidirectional: edge.bidirectional === true }
            });
        });
        return elements;
    }

    function layoutOptions(name, animate) {
        const options = { name, padding: 30, animate, animationDuration: 500 };
        if (name === 'cose') {
            Object.assign(options, { nodeRepulsion: 8000, idealEdgeLength: 120, edgeElasticity: 200 });
        } else if (name === 'breadthfirst') {
            Object.assign(options, { directed: true, spacingFactor: 1.5 });
        }
        return options;
    }

    /** Create the Cytoscape instance once and update its elements on every document change. */
    function renderGraph() {
        if (!cy) {
            cy = cytoscape({ container: $('cy'), layout: { name: 'preset' } });
            cy.on('tap', 'node', (evt) => focusNode(evt.target.id(), false));
            cy.on('tap', (evt) => {
                if (evt.target === cy) {
                    resetDetails();
                    cy.elements().removeClass('highlighted dimmed path-highlight');
                    show('pathResult');
                }
            });
        }

        // Keep node positions across edits so the graph does not jump while the user types
        const positions = new Map();
        cy.nodes().forEach(node => positions.set(node.id(), { ...node.position() }));

        cy.batch(() => {
            cy.elements().remove();
            cy.add(buildElements());
        });
        cy.style(buildStyle());

        const newNodes = cy.nodes().filter(node => !positions.has(node.id()));
        cy.nodes().forEach(node => { if (positions.has(node.id())) { node.position(positions.get(node.id())); } });

        if (!hasLaidOut || newNodes.length > 0) {
            cy.layout(layoutOptions(currentLayout, false)).run();
            hasLaidOut = true;
        }
        cy.fit(undefined, 30);

        allNodes = cy.nodes()
            .map(node => ({ id: node.id(), label: node.data('label') }))
            .sort((a, b) => a.label.localeCompare(b.label));

        $('graphInfo').textContent = `Nodes: ${graphData.nodes.length} | Edges: ${graphData.edges.length}`;

        resetDetails();
        clearClusters();
        clearCentrality();
        show('linkResult');
        populateRelationshipFilter();
    }

    // ---------------------------------------------------------------- Node details

    function resetDetails() {
        show('nodeDetails', el('p', { className: 'no-selection', text: 'Click a node to view details' }));
    }

    function showNodeDetails(node) {
        const data = node.data();
        const style = graphData.nodeStyles.find(s => s.type === data.type);
        const color = safeColor(style && style.color, '#666666');
        const source = graphData.nodes.find(n => n.id === data.id);
        // Properties arrive as [key, value] string pairs
        const properties = (source && Array.isArray(source.properties) ? source.properties : [])
            .filter(pair => Array.isArray(pair) && pair.length === 2);

        const connections = node.connectedEdges().map(edge => {
            const outgoing = edge.source().id() === data.id;
            const other = outgoing ? edge.target() : edge.source();
            const arrow = edge.data('bidirectional') ? '↔' : (outgoing ? '→' : '←');
            const label = edge.data('label');
            return el('li', { on: { click: () => focusNode(other.id(), true) } },
                `${arrow} ${other.data('label')}`, label ? el('span', { className: 'muted', text: ` [${label}]` }) : null);
        });

        show('nodeDetails',
            el('div', { className: 'details-section' },
                el('div', { className: 'details-label', text: 'Node Name' }),
                el('div', { className: 'details-value', text: data.label })),
            el('div', { className: 'details-section' },
                el('div', { className: 'details-label', text: 'Type' }),
                el('div', { className: 'details-value' },
                    el('span', { className: 'node-type-badge', text: data.type, style: { color } }))),
            properties.length > 0 && el('div', { className: 'details-section' },
                el('div', { className: 'details-label', text: 'Properties' }),
                el('ul', { className: 'property-list' }, ...properties.map(([key, value]) =>
                    el('li', null, el('span', { className: 'property-key', text: key }), ': ', String(value))))),
            connections.length > 0 && el('div', { className: 'details-section' },
                el('div', { className: 'details-label', text: `Connections (${connections.length})` }),
                el('ul', { className: 'connection-list' }, ...connections))
        );
    }

    /** Highlight a node and its neighborhood; optionally center the view on it. */
    function focusNode(nodeId, center) {
        if (!cy) { return; }
        const node = cy.getElementById(nodeId);
        if (node.empty()) { return; }
        if (center) {
            cy.animate({ center: { eles: node }, zoom: 1.5 }, { duration: 500 });
        }
        showNodeDetails(node);
        cy.elements().removeClass('highlighted path-highlight').addClass('dimmed');
        node.removeClass('dimmed').addClass('highlighted');
        node.connectedEdges().removeClass('dimmed').addClass('highlighted');
        node.connectedEdges().connectedNodes().removeClass('dimmed');
    }

    // ---------------------------------------------------------------- Search and layout

    function searchNodes() {
        if (!cy) { return; }
        const query = $('searchInput').value.toLowerCase();
        cy.elements().removeClass('highlighted dimmed');
        if (!query) { cy.fit(undefined, 30); return; }
        const matches = cy.nodes().filter(node => node.data('label').toLowerCase().includes(query));
        if (matches.length > 0) {
            cy.elements().addClass('dimmed');
            matches.removeClass('dimmed').addClass('highlighted');
            matches.connectedEdges().removeClass('dimmed').addClass('highlighted');
            matches.connectedEdges().connectedNodes().removeClass('dimmed');
            cy.fit(matches, 50);
        }
    }

    function changeLayout() {
        currentLayout = $('layoutSelect').value;
        if (cy) { cy.layout(layoutOptions(currentLayout, true)).run(); }
    }

    // ---------------------------------------------------------------- Path finder

    function handleAutocomplete(kind) {
        const query = $(kind + 'Search').value;
        const dropdown = $(kind + 'Dropdown');
        const matches = query ? allNodes.filter(node => node.label.toLowerCase().includes(query.toLowerCase())) : [];
        dropdown.replaceChildren(...matches.map(node =>
            el('div', { className: 'autocomplete-item', on: { click: () => selectNode(kind, node) } },
                ...highlightMatch(node.label, query))));
        dropdown.classList.toggle('show', matches.length > 0);
    }

    function selectNode(kind, node) {
        if (kind === 'start') { selectedStartNode = node.id; } else { selectedEndNode = node.id; }
        $(kind + 'Search').value = node.label;
        $(kind + 'Dropdown').classList.remove('show');
    }

    function pathMessage(text, isError) {
        show('pathResult', el('div', { className: 'path-result' + (isError ? ' error' : ''), text }));
    }

    function findPath() {
        if (!cy) { return; }
        cy.elements().removeClass('highlighted path-highlight dimmed');
        if (!selectedStartNode || !selectedEndNode) { pathMessage('Please select both start and end nodes'); return; }
        if (selectedStartNode === selectedEndNode) { pathMessage('Start and end nodes are the same'); return; }

        const start = cy.getElementById(selectedStartNode);
        const end = cy.getElementById(selectedEndNode);
        if (start.empty() || end.empty()) { pathMessage('Could not find selected nodes'); return; }

        let path = cy.elements().aStar({ root: start, goal: end, directed: true });
        if (!path.found) { path = cy.elements().aStar({ root: start, goal: end, directed: false }); }
        if (!path.found) { pathMessage('No path found between these nodes', true); return; }

        cy.elements().addClass('dimmed');
        path.path.removeClass('dimmed').addClass('path-highlight');

        const labels = path.path.nodes().map(node => node.data('label'));
        const hops = labels.length - 1;
        show('pathResult', el('div', { className: 'path-result' },
            el('div', { className: 'path-length', text: `Path found: ${hops} hop${hops !== 1 ? 's' : ''}` }),
            el('div', { className: 'path-steps', text: labels.join(' → ') })));
        cy.fit(path.path, 50);
    }

    function clearPath() {
        if (!cy) { return; }
        cy.elements().removeClass('highlighted dimmed path-highlight');
        show('pathResult');
        $('startSearch').value = '';
        $('endSearch').value = '';
        selectedStartNode = null;
        selectedEndNode = null;
    }

    // ---------------------------------------------------------------- Controls

    function fitGraph() { if (cy) { cy.fit(undefined, 30); } }

    function exportPNG() {
        if (!cy) { return; }
        const blob = cy.png({ output: 'blob', bg: 'white', full: true, scale: 2 });
        const url = URL.createObjectURL(blob);
        const link = el('a', { attrs: { href: url, download: 'dotld-graph.png' } });
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    // ---------------------------------------------------------------- Relationship filter

    const relationshipTypes = new Map();
    const selectedRelationships = new Set();
    let allRelationships = [];

    function populateRelationshipFilter() {
        relationshipTypes.clear();
        selectedRelationships.clear();
        cy.edges().forEach(edge => {
            const label = edge.data('label');
            if (label) { relationshipTypes.set(label, (relationshipTypes.get(label) || 0) + 1); }
        });
        allRelationships = Array.from(relationshipTypes.entries()).sort((a, b) => b[1] - a[1]);
        relationshipTypes.forEach((count, type) => selectedRelationships.add(type));
        $('relationshipSearch').value = '';
        renderRelationshipList('');
    }

    function renderRelationshipList(filterText) {
        const query = filterText.toLowerCase();
        const filtered = query ? allRelationships.filter(([type]) => type.toLowerCase().includes(query)) : allRelationships;
        const items = filtered.map(([type, count]) => {
            const checkbox = el('input', { attrs: { type: 'checkbox', checked: selectedRelationships.has(type), 'aria-label': type } });
            const item = el('div', { className: 'relationship-item' },
                checkbox,
                el('span', { className: 'relationship-label' }, ...highlightMatch(type, filterText)),
                el('span', { className: 'relationship-count', text: count }));
            item.addEventListener('click', (evt) => {
                if (evt.target !== checkbox) { checkbox.checked = !checkbox.checked; }
                toggleRelationship(type, checkbox.checked);
            });
            return item;
        });
        show('relationshipList', ...(items.length ? items : [el('p', { className: 'no-selection', text: 'No matches' })]));
    }

    function toggleRelationship(type, selected) {
        if (selected) { selectedRelationships.add(type); } else { selectedRelationships.delete(type); }
        applyRelationshipFilter();
    }

    function setAllRelationships(selected) {
        relationshipTypes.forEach((count, type) => {
            if (selected) { selectedRelationships.add(type); } else { selectedRelationships.delete(type); }
        });
        renderRelationshipList($('relationshipSearch').value);
        applyRelationshipFilter();
    }

    function applyRelationshipFilter() {
        const isSelected = edge => Boolean(edge.data('label')) && selectedRelationships.has(edge.data('label'));
        if (selectedRelationships.size === relationshipTypes.size) {
            cy.elements().removeClass('dimmed');
            cy.edges().removeStyle('label');
            return;
        }
        cy.elements().addClass('dimmed');
        const selected = cy.edges().filter(isSelected);
        selected.removeClass('dimmed').removeStyle('label');
        selected.connectedNodes().removeClass('dimmed');
        cy.edges().filter(edge => !isSelected(edge)).style('label', '');
    }

    // ---------------------------------------------------------------- Community detection

    const CLUSTER_COLORS = ['#2196F3', '#4CAF50', '#FF9800', '#E91E63', '#9C27B0', '#00BCD4', '#8BC34A', '#FF5722', '#673AB7', '#009688'];
    let clusterData = [];
    const selectedClusters = new Set();

    function generateClusterName(clusterNodes) {
        const typeCounts = new Map();
        clusterNodes.forEach(node => {
            const type = node.data('type');
            if (type && type !== 'default') { typeCounts.set(type, (typeCounts.get(type) || 0) + 1); }
        });
        const [commonType, count] = Array.from(typeCounts.entries()).sort((a, b) => b[1] - a[1])[0] || [];
        if (commonType && count >= 2) { return commonType.charAt(0).toUpperCase() + commonType.slice(1); }
        return clusterNodes.reduce((best, node) => (node.degree() > best.degree() ? node : best), clusterNodes[0]).data('label');
    }

    function runClusterAnalysis() {
        if (!cy) { return; }
        clearClusters();
        clearCentrality();

        // Label propagation
        const community = new Map();
        cy.nodes().forEach((node, i) => community.set(node.id(), i));
        for (let iteration = 0, changed = true; changed && iteration < 10; iteration++) {
            changed = false;
            cy.nodes().forEach(node => {
                const counts = new Map();
                node.neighborhood('node').forEach(neighbor => {
                    const c = community.get(neighbor.id());
                    counts.set(c, (counts.get(c) || 0) + 1);
                });
                if (counts.size > 0) {
                    const best = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0][0];
                    if (community.get(node.id()) !== best) { community.set(node.id(), best); changed = true; }
                }
            });
        }

        const groups = new Map();
        community.forEach((c, nodeId) => {
            if (!groups.has(c)) { groups.set(c, []); }
            groups.get(c).push(cy.getElementById(nodeId));
        });
        const clusters = Array.from(groups.values()).filter(g => g.length > 1).sort((a, b) => b.length - a.length).slice(0, 6);

        clusterData = clusters.map((nodes, index) => {
            const color = CLUSTER_COLORS[index % CLUSTER_COLORS.length];
            nodes.forEach(node => {
                node.data('cluster', index);
                node.style({ 'background-color': color, 'border-color': color });
            });
            selectedClusters.add(index);
            return { id: index, nodes, color, name: generateClusterName(nodes) };
        });

        applyClusterFilter();

        const items = clusterData.map(cluster => {
            const checkbox = el('input', {
                className: 'cluster-checkbox',
                attrs: { type: 'checkbox', checked: true, 'aria-label': cluster.name },
                on: { change: () => toggleCluster(cluster.id, checkbox.checked) }
            });
            return el('div', { className: 'cluster-result-item' },
                checkbox,
                el('span', { className: 'cluster-badge', style: { 'background-color': cluster.color } }),
                el('span', { className: 'cluster-name', text: `${cluster.name} (${cluster.nodes.length})` }),
                el('button', { className: 'small-btn', text: 'Focus', on: { click: () => cy.fit(cy.collection(cluster.nodes), 50) } }));
        });

        show('clusterResult', el('div', { className: 'cluster-results' },
            el('div', { className: 'cluster-header' },
                el('span', { text: `Clusters: ${clusterData.length}` }),
                el('span', { className: 'filter-actions' },
                    el('button', { className: 'small-btn', text: 'All', on: { click: () => setAllClusters(true) } }),
                    el('button', { className: 'small-btn', text: 'None', on: { click: () => setAllClusters(false) } }))),
            ...(items.length ? items : [el('p', { className: 'no-selection', text: 'No clusters with more than one node' })])));
    }

    function toggleCluster(clusterId, selected) {
        if (selected) { selectedClusters.add(clusterId); } else { selectedClusters.delete(clusterId); }
        applyClusterFilter();
    }

    function setAllClusters(selected) {
        clusterData.forEach(cluster => (selected ? selectedClusters.add(cluster.id) : selectedClusters.delete(cluster.id)));
        $('clusterResult').querySelectorAll('.cluster-checkbox').forEach(cb => { cb.checked = selected; });
        applyClusterFilter();
    }

    function applyClusterFilter() {
        const inSelected = node => selectedClusters.has(node.data('cluster'));
        cy.nodes().forEach(node => node.toggleClass('dimmed', !inSelected(node)));
        cy.edges().forEach(edge => {
            const source = edge.source().data('cluster');
            const target = edge.target().data('cluster');
            edge.toggleClass('dimmed', !(inSelected(edge.source()) && inSelected(edge.target())));
            edge.toggleClass('intra-cluster-edge', source !== undefined && source === target);
            edge.toggleClass('inter-cluster-edge', source !== undefined && target !== undefined && source !== target);
        });
    }

    function clearClusters() {
        if (!cy) { return; }
        cy.nodes().removeStyle('background-color border-color').removeData('cluster');
        cy.elements().removeClass('dimmed intra-cluster-edge inter-cluster-edge');
        clusterData = [];
        selectedClusters.clear();
        show('clusterResult');
    }

    // ---------------------------------------------------------------- Centrality

    function runCentralityAnalysis(kind) {
        if (!cy) { return; }
        clearClusters();
        clearCentrality();

        const scores = {};
        let title = '';
        if (kind === 'degree') {
            title = 'Degree Centrality';
            cy.nodes().forEach(node => { scores[node.id()] = node.degree(); });
        } else if (kind === 'betweenness') {
            title = 'Betweenness Centrality';
            const bc = cy.elements().betweennessCentrality({ directed: false });
            cy.nodes().forEach(node => { scores[node.id()] = bc.betweenness(node); });
        } else {
            title = 'Closeness Centrality';
            cy.nodes().forEach(node => {
                const dijkstra = cy.elements().dijkstra({ root: node, directed: false });
                let total = 0;
                let reachable = 0;
                cy.nodes().forEach(target => {
                    const distance = dijkstra.distanceTo(target);
                    if (target.id() !== node.id() && Number.isFinite(distance)) { total += distance; reachable++; }
                });
                scores[node.id()] = total > 0 ? reachable / total : 0;
            });
        }

        const values = Object.values(scores);
        const min = Math.min(...values);
        const max = Math.max(...values);
        cy.nodes().forEach(node => {
            const normalized = max > min ? (scores[node.id()] - min) / (max - min) : 0.5;
            const size = 100 + normalized * 80;
            node.style({ 'width': size + 'px', 'height': (size * 0.6) + 'px', 'opacity': 0.4 + normalized * 0.6 });
        });

        const top = Object.entries(scores).sort((a, b) => b[1] - a[1]).slice(0, 5);
        show('centralityResult', el('div', { className: 'analysis-result' },
            el('div', { className: 'result-title', text: title }),
            el('div', { className: 'result-note', text: 'Node size = centrality score' }),
            el('div', { className: 'result-subtitle', text: 'Top 5 Nodes:' }),
            ...top.map(([nodeId, score], index) =>
                el('div', { className: 'centrality-node-link', on: { click: () => focusNode(nodeId, true) } },
                    `${index + 1}. ${cy.getElementById(nodeId).data('label')} `,
                    el('span', { className: 'muted', text: `(${score.toFixed(2)})` })))));
    }

    function clearCentrality() {
        if (!cy) { return; }
        cy.nodes().removeStyle('width height opacity');
        cy.elements().removeClass('dimmed highlighted path-highlight');
        show('centralityResult');
    }

    // ---------------------------------------------------------------- Link prediction

    function suggestLinks() {
        if (!cy) { return; }
        clearClusters();
        clearCentrality();

        const neighbors = new Map();
        cy.nodes().forEach(node => neighbors.set(node.id(), new Set(node.neighborhood('node').map(n => n.id()))));

        const suggestions = [];
        const nodes = cy.nodes().toArray();
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const a = nodes[i];
                const b = nodes[j];
                if (a.edgesWith(b).length > 0) { continue; }
                const na = neighbors.get(a.id());
                const nb = neighbors.get(b.id());
                const common = [...na].filter(x => nb.has(x)).length;
                if (common > 0) {
                    const union = new Set([...na, ...nb]).size;
                    suggestions.push({ a: a.data('label'), b: b.data('label'), score: common / union, common });
                }
            }
        }

        const top = suggestions.sort((x, y) => y.score - x.score).slice(0, 10);
        if (top.length === 0) {
            show('linkResult', el('div', { className: 'analysis-result', text: 'No link suggestions found.' }));
            return;
        }
        show('linkResult', el('div', { className: 'analysis-result' },
            el('div', { className: 'result-title', text: 'Suggested Links' }),
            el('div', { className: 'result-note', text: 'Based on common neighbors' }),
            ...top.map((s, index) => el('div', { className: 'suggestion' },
                `${index + 1}. ${s.a} → ${s.b}`,
                el('div', { className: 'muted', text: `${s.common} common neighbor${s.common > 1 ? 's' : ''}` })))));
    }

    // ---------------------------------------------------------------- Wiring

    function on(id, event, handler) { $(id).addEventListener(event, handler); }

    on('searchInput', 'input', searchNodes);
    on('layoutSelect', 'change', changeLayout);
    on('fitBtn', 'click', fitGraph);
    on('exportBtn', 'click', exportPNG);
    on('startSearch', 'input', () => handleAutocomplete('start'));
    on('startSearch', 'focus', () => handleAutocomplete('start'));
    on('endSearch', 'input', () => handleAutocomplete('end'));
    on('endSearch', 'focus', () => handleAutocomplete('end'));
    on('findPathBtn', 'click', findPath);
    on('clearPathBtn', 'click', clearPath);
    on('relationshipSearch', 'input', () => renderRelationshipList($('relationshipSearch').value));
    on('selectAllRel', 'click', () => setAllRelationships(true));
    on('clearAllRel', 'click', () => setAllRelationships(false));
    on('clusterBtn', 'click', runClusterAnalysis);
    on('clearClusterBtn', 'click', clearClusters);
    on('degreeCentralBtn', 'click', () => runCentralityAnalysis('degree'));
    on('betweenCentralBtn', 'click', () => runCentralityAnalysis('betweenness'));
    on('closenessCentralBtn', 'click', () => runCentralityAnalysis('closeness'));
    on('clearCentralBtn', 'click', clearCentrality);
    on('linkPredictBtn', 'click', suggestLinks);

    document.addEventListener('click', (evt) => {
        if (!evt.target.closest('.autocomplete-container')) {
            document.querySelectorAll('.autocomplete-dropdown').forEach(dropdown => dropdown.classList.remove('show'));
        }
    });

    // Graph data arrives from the extension; validate its shape before use
    window.addEventListener('message', (event) => {
        const message = event.data;
        if (!message || message.type !== 'graph' || !message.data) { return; }
        const data = message.data;
        if (!Array.isArray(data.nodes) || !Array.isArray(data.edges) || !Array.isArray(data.nodeStyles)) { return; }

        graphData = data;
        if (typeof message.layout === 'string' && !hasLaidOut) {
            currentLayout = message.layout;
            $('layoutSelect').value = message.layout;
        }
        renderGraph();
    });

    vscode.postMessage({ type: 'ready' });
})();
