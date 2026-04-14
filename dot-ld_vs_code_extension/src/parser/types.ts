/**
 * Type definitions for DOT-LD parser and graph data
 */

export interface Node {
    id: string;
    label: string;
    type: string;
}

export interface Edge {
    source: string;
    target: string;
    label: string;
}

export interface NodeStyle {
    shape: string;
    color: string;
    size: number;
}

export interface ParsedGraph {
    nodes: Map<string, Node>;
    edges: Edge[];
    nodeStyles: Map<string, NodeStyle>;
}

export interface GraphData {
    nodes: Node[];
    edges: Edge[];
    nodeStyles: Array<{
        type: string;
        shape: string;
        color: string;
        size: number;
    }>;
}
