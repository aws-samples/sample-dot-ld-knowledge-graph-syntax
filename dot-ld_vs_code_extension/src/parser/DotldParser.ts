/**
 * Parser for DOT-LD markdown documents (DOT-LD v1.0, see docs/syntax-specification.md).
 * Extracts nodes, edges and style definitions from DOT-LD notation.
 */

import { Edge, EntityProperties, GraphData, Node, NodeStyle, ParsedGraph } from './types';

/**
 * Entity and type names must start with a letter and contain only letters, digits, "_" or "-"
 * (spec 4.2). Names flow into the webview and graph selectors, so nothing else is accepted.
 */
export const DOTLD_NAME_RE = /^[A-Za-z][\w-]*$/;
export const DOTLD_SHAPES: ReadonlySet<string> = new Set(['round-rectangle', 'rectangle', 'ellipse', 'circle', 'diamond']);
const COLOR_RE = /^#[0-9A-Fa-f]{6}$/;
const SIZE_RANGE = { min: 20, max: 300 };
const DEFAULT_STYLE: NodeStyle = { shape: 'round-rectangle', color: '#666666', size: 100 };

/**
 * Remove fenced code blocks and inline code spans, so DOT-LD syntax shown as an example
 * inside a document is not parsed as real config, references or relationships.
 */
export function stripMarkdownCode(text: string): string {
    return text
        // Fenced blocks: ``` or ~~~ (3+), closed by the same fence or the end of the document
        .replace(/^[ \t]{0,3}((`|~)\2{2,})[^\n]*\n[\s\S]*?(?:^[ \t]{0,3}\1\2*[ \t]*$|(?![\s\S]))/gm, '')
        // Code spans: matching backtick runs within one paragraph
        .replace(/(?<!`)(`+)(?!`)(?:(?!\n[ \t]*\n)[\s\S])+?(?<!`)\1(?!`)/g, '');
}

export class DotldParser {
    /**
     * Check if content contains DOT-LD notation outside code blocks
     */
    public static hasDotldNotation(content: string): boolean {
        const source = stripMarkdownCode(content);
        return /^::config[ \t]*$/m.test(source) || /::rel[ \t]/.test(source);
    }

    /**
     * Parse a DOT-LD markdown document
     * @param content - Raw markdown content with DOT-LD notation
     * @returns ParsedGraph with nodes, edges, style definitions and validation warnings
     */
    public static parse(content: string): ParsedGraph {
        const source = stripMarkdownCode(content.replace(/\r\n?/g, '\n'));
        const warnings: string[] = [];
        const nodeStyles = new Map<string, NodeStyle>();
        const entities = new Map<string, { type: string; properties: EntityProperties }>();

        DotldParser.parseConfig(source, nodeStyles, entities, warnings);

        if (!nodeStyles.has('default')) {
            nodeStyles.set('default', { ...DEFAULT_STYLE });
        }
        entities.forEach((entity, name) => {
            if (!nodeStyles.has(entity.type)) {
                warnings.push(`Entity "${name}" uses undefined type "${entity.type}"; the default style is used.`);
            }
        });

        const nodes = new Map<string, Node>();
        const ensureNode = (name: string) => {
            if (nodes.has(name)) {
                return;
            }
            const entity = entities.get(name);
            nodes.set(name, {
                id: name,
                label: name,
                type: entity ? entity.type : 'default',
                properties: entity ? entity.properties : []
            });
        };

        // Nodes: every entity in the catalog plus every [[...]] reference (spec 8.3)
        entities.forEach((entity, name) => ensureNode(name));
        for (const [, name] of source.matchAll(/\[\[([^[\]\n]+)\]\]/g)) {
            if (DOTLD_NAME_RE.test(name)) {
                ensureNode(name);
            } else {
                warnings.push(`Invalid entity reference [[${name}]]: names start with a letter and use only letters, digits, "_" or "-".`);
            }
        }

        const edges = DotldParser.parseRelationships(source, warnings);
        edges.forEach(edge => {
            ensureNode(edge.source);
            ensureNode(edge.target);
        });

        return { nodes, edges, nodeStyles, warnings };
    }

    /**
     * Parse every ::config block in document order (spec 3.5). Later definitions override earlier ones.
     */
    private static parseConfig(
        source: string,
        nodeStyles: Map<string, NodeStyle>,
        entities: Map<string, { type: string; properties: EntityProperties }>,
        warnings: string[]
    ): void {
        for (const block of source.matchAll(/^::config[ \t]*\n([\s\S]*?)^::[ \t]*$/gm)) {
            for (const rawLine of block[1].split('\n')) {
                // Comments start with "//" at the start of a line or after whitespace (spec 3.4)
                const line = rawLine.replace(/(^|\s)\/\/.*$/, '').trim();
                if (!line) {
                    continue;
                }

                // Entity assignment: Name: type=typeName[, key=value, ...] (spec 3.3)
                const entity = /^([A-Za-z][\w-]*)\s*:\s*type\s*=\s*([A-Za-z][\w-]*)\s*(?:,(.*))?$/.exec(line);
                if (entity) {
                    const [, name, type, rest] = entity;
                    entities.set(name, { type, properties: DotldParser.parseProperties(rest || '', name, warnings) });
                    continue;
                }

                // Type definition: typeName: shape, #RRGGBB, size (spec 3.2)
                const style = /^([A-Za-z][\w-]*)\s*:\s*([^,]+),([^,]+),([^,]+)$/.exec(line);
                if (style) {
                    const [, type, shape, color, size] = style.map(part => part.trim());
                    nodeStyles.set(type, DotldParser.validateStyle(type, shape, color, size, warnings));
                    continue;
                }

                warnings.push(`Unrecognized config line: "${line}"`);
            }
        }
    }

    /** Validate a type definition, falling back to defaults for invalid values. */
    private static validateStyle(type: string, shapeRaw: string, colorRaw: string, sizeRaw: string, warnings: string[]): NodeStyle {
        let shape = shapeRaw.toLowerCase();
        if (!DOTLD_SHAPES.has(shape)) {
            warnings.push(`Type "${type}": unsupported shape "${shapeRaw}"; use one of ${[...DOTLD_SHAPES].join(', ')}.`);
            shape = DEFAULT_STYLE.shape;
        }

        let color = colorRaw;
        if (!COLOR_RE.test(color)) {
            warnings.push(`Type "${type}": color "${colorRaw}" must be in #RRGGBB format.`);
            color = DEFAULT_STYLE.color;
        }

        let size = /^\d+$/.test(sizeRaw) ? Number.parseInt(sizeRaw, 10) : NaN;
        if (Number.isNaN(size)) {
            warnings.push(`Type "${type}": size "${sizeRaw}" must be a whole number.`);
            size = DEFAULT_STYLE.size;
        } else if (size < SIZE_RANGE.min || size > SIZE_RANGE.max) {
            warnings.push(`Type "${type}": size ${size} is outside ${SIZE_RANGE.min}-${SIZE_RANGE.max} and was clamped.`);
            size = Math.min(Math.max(size, SIZE_RANGE.min), SIZE_RANGE.max);
        }

        return { shape, color, size };
    }

    /**
     * Parse optional entity properties: key=value or key="quoted value", comma-separated.
     * A Map collects them (later keys override earlier ones); the result is [key, value] pairs.
     */
    private static parseProperties(rest: string, entityName: string, warnings: string[]): EntityProperties {
        const properties = new Map<string, string>();
        for (const part of rest.split(',')) {
            if (!part.trim()) {
                continue;
            }
            const match = /^\s*([A-Za-z][\w-]*)\s*=\s*(?:"([^"]*)"|([^"]*?))\s*$/.exec(part);
            if (match) {
                properties.set(match[1], match[2] ?? match[3]);
            } else {
                warnings.push(`Entity "${entityName}": ignored property "${part.trim()}".`);
            }
        }
        return Array.from(properties);
    }

    /** Parse relationships: ::rel Source (->|<-|<->) Target [label] :: (spec 5). */
    private static parseRelationships(source: string, warnings: string[]): Edge[] {
        const relRe = /^::rel[ \t]+([A-Za-z][\w-]*)[ \t]*(<->|<-|->)[ \t]*([A-Za-z][\w-]*)[ \t]*(?:\[([^\]\n]*)\])?[ \t]*::$/;
        const edges: Edge[] = [];
        const seen = new Set<string>();

        for (const [raw] of source.matchAll(/::rel[ \t][^\n]*?::/g)) {
            const match = relRe.exec(raw);
            if (!match) {
                warnings.push(`Malformed relationship: ${raw}`);
                continue;
            }

            const [, left, arrow, right, rawLabel = ''] = match;
            const label = rawLabel.trim();
            // "A <- B" means "B -> A" (spec 5.2)
            const [edgeSource, edgeTarget] = arrow === '<-' ? [right, left] : [left, right];
            const bidirectional = arrow === '<->';

            // Skip exact duplicates (spec 5.6)
            const key = [edgeSource, edgeTarget, label, bidirectional].join('\u0000');
            if (!seen.has(key)) {
                seen.add(key);
                edges.push({ source: edgeSource, target: edgeTarget, label, bidirectional });
            }
        }
        return edges;
    }

    /**
     * Convert ParsedGraph to GraphData format for the webview
     */
    public static toGraphData(parsed: ParsedGraph): GraphData {
        return {
            nodes: Array.from(parsed.nodes.values()).map(node => ({ ...node, properties: node.properties.map(([k, v]) => [k, v] as [string, string]) })),
            edges: parsed.edges,
            nodeStyles: Array.from(parsed.nodeStyles.entries()).map(([type, style]) => ({ type, ...style }))
        };
    }
}
