/**
 * Parser for DOT-LD markdown documents
 * Extracts nodes, edges, and style definitions from DOT-LD notation
 */

import { ParsedGraph, Node, NodeStyle } from './types';

export class DotldParser {
    /**
     * Check if content contains DOT-LD notation
     */
    public static hasDotldNotation(content: string): boolean {
        return content.includes('::config') || content.includes('::rel');
    }

    /**
     * Parse a DOT-LD markdown document
     * @param content - Raw markdown content with DOT-LD notation
     * @returns ParsedGraph with nodes, edges, and style definitions
     */
    public static parse(content: string): ParsedGraph {
        const nodes = new Map<string, Node>();
        const edges: Array<{ source: string; target: string; label: string }> = [];
        const edgeSet = new Set<string>(); // Track unique edges
        const nodeStyles = new Map<string, NodeStyle>();
        const entityDefinitions = new Map<string, { type: string }>();

        try {
            // Parse config block
            const configMatch = content.match(/::config\s*([\s\S]*?)::/);
            if (configMatch) {
                const configContent = configMatch[1];
                const lines = configContent.split('\n');

                for (const line of lines) {
                    if (!line.trim() || line.trim().startsWith('//')) {
                        continue;
                    }

                    const lineWithoutComment = line.split('//')[0].trim();

                    // Parse style definition: type: shape, color, size
                    const styleMatch = lineWithoutComment.match(/^([\w-]+):\s*([^,\s]+),\s*([^,\s]+),\s*(\d+)\s*$/);
                    if (styleMatch) {
                        const [, type, shape, color, size] = styleMatch;
                        nodeStyles.set(type, {
                            shape,
                            color,
                            size: parseInt(size, 10)
                        });
                        continue;
                    }

                    // Parse entity definition: EntityName: type=typeName
                    const entityMatch = lineWithoutComment.match(/^([\w-]+):\s*type=([\w-]+)\s*$/);
                    if (entityMatch) {
                        const [, entity, type] = entityMatch;
                        entityDefinitions.set(entity, { type });
                    }
                }
            }

            // Parse inline node references [[...]]
            const nodeRefRegex = /\[\[([^\]]+)\]\]/g;
            let match;
            while ((match = nodeRefRegex.exec(content)) !== null) {
                const nodeName = match[1];
                const entityDef = entityDefinitions.get(nodeName);
                if (!nodes.has(nodeName)) {
                    nodes.set(nodeName, {
                        id: nodeName,
                        label: nodeName,
                        type: entityDef ? entityDef.type : 'default'
                    });
                }
            }

            // Parse relationships ::rel source -> target [label] ::
            // Support alphanumeric, underscores, and hyphens in entity names
            const relRegex = /::rel\s+([\w-]+)\s*->\s*([\w-]+)\s*(?:\[([^\]]*)\])?\s*::/g;
            while ((match = relRegex.exec(content)) !== null) {
                const [, source, target, label] = match;
                
                // Create unique key for this edge
                const edgeKey = `${source}|${target}|${label || ''}`;
                
                // Only add if not already present
                if (!edgeSet.has(edgeKey)) {
                    edges.push({
                        source,
                        target,
                        label: label || ''
                    });
                    edgeSet.add(edgeKey);
                }

                // Ensure nodes exist (nodes are already deduplicated by Map)
                [source, target].forEach(nodeName => {
                    if (!nodes.has(nodeName)) {
                        const entityDef = entityDefinitions.get(nodeName);
                        nodes.set(nodeName, {
                            id: nodeName,
                            label: nodeName,
                            type: entityDef ? entityDef.type : 'default'
                        });
                    }
                });
            }
        } catch (error) {
            console.error('Error parsing DOT-LD content:', error);
        }

        return { nodes, edges, nodeStyles };
    }

    /**
     * Convert ParsedGraph to GraphData format for webview
     */
    public static toGraphData(parsed: ParsedGraph): {
        nodes: Node[];
        edges: Array<{ source: string; target: string; label: string }>;
        nodeStyles: Array<{ type: string; shape: string; color: string; size: number }>;
    } {
        return {
            nodes: Array.from(parsed.nodes.values()),
            edges: parsed.edges,
            nodeStyles: Array.from(parsed.nodeStyles.entries()).map(([type, style]) => ({
                type,
                ...style
            }))
        };
    }
}
