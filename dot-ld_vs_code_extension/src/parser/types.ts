/**
 * Type definitions for DOT-LD parser and graph data
 */

/**
 * Entity properties from `Name: type=t, key=value` (spec 3.3), as [key, value] pairs.
 * Pairs (not an object) keep keys such as "__proto__" as plain data.
 */
export type EntityProperties = Array<[string, string]>;

export interface Node {
    id: string;
    label: string;
    type: string;
    properties: EntityProperties;
}

export interface Edge {
    source: string;
    target: string;
    label: string;
    /** True for `<->` relationships (spec 5.2). */
    bidirectional: boolean;
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
    /** Validation problems found while parsing (unknown shapes, invalid names, ...). */
    warnings: string[];
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
