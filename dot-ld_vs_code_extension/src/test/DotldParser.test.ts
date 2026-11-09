/**
 * Parser tests. Run with: npm test
 */

import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import { DotldParser, stripMarkdownCode } from '../parser/DotldParser';

const edgesOf = (doc: string) =>
    DotldParser.parse(doc).edges.map(e => `${e.source}${e.bidirectional ? '<->' : '->'}${e.target}[${e.label}]`);

test('parses ->, <- and <-> arrows and hyphenated names (spec 4.2, 5.2)', () => {
    assert.deepEqual(edgesOf([
        '::rel A -> B [uses] ::',
        '::rel C <- D [feeds] ::',
        '::rel E <-> F [talks_to] ::',
        '::rel user-profile -> auth-service [calls] ::',
        '::rel A -> B ::'
    ].join('\n')), ['A->B[uses]', 'D->C[feeds]', 'E<->F[talks_to]', 'user-profile->auth-service[calls]', 'A->B[]']);
});

test('skips exact duplicate relationships (spec 5.6)', () => {
    assert.deepEqual(edgesOf('::rel A -> B [uses] ::\n::rel A -> B [uses] ::'), ['A->B[uses]']);
});

test('merges all ::config blocks in order and parses properties (spec 3.3, 3.5)', () => {
    const parsed = DotldParser.parse([
        '::config', 'equipment: round-rectangle, #2196F3, 120', 'A: type=equipment', '::',
        'text',
        '::config', 'component: circle, #4CAF50, 80', 'B: type=component, vendor=Acme, note="two words"',
        'equipment: diamond, #FF9800, 90 // later definition wins', '::'
    ].join('\n'));
    assert.deepEqual(parsed.nodeStyles.get('equipment'), { shape: 'diamond', color: '#FF9800', size: 90 });
    assert.equal(parsed.nodes.get('B')?.type, 'component');
    assert.deepEqual(parsed.nodes.get('B')?.properties, [['vendor', 'Acme'], ['note', 'two words']]);
    assert.deepEqual(parsed.warnings, []);
});

test('validates shapes, colors, sizes, names and relationships', () => {
    const parsed = DotldParser.parse([
        '::config', 'bad: hexagon, red, 9999', 'X: type=nope', 'what is this', '::',
        '[[Foo" onmouseover="x]] [[1abc]] [[Ok]]',
        '::rel A => B ::'
    ].join('\n'));
    assert.deepEqual(parsed.nodeStyles.get('bad'), { shape: 'round-rectangle', color: '#666666', size: 300 });
    assert.deepEqual([...parsed.nodes.keys()], ['X', 'Ok']);
    assert.equal(parsed.warnings.length, 8);
});

test('ignores DOT-LD syntax inside code fences and code spans', () => {
    const doc = [
        '::config', 't: ellipse, #111111, 80', 'Real: type=t', '::',
        '```', '::config', 'Fake: type=t', '::', '[[FenceRef]]', '::rel Fake -> Real [x] ::', '```',
        'Inline `[[CodeRef]]` and `::rel Q -> R ::` and [[Real]].'
    ].join('\n');
    const parsed = DotldParser.parse(doc);
    assert.deepEqual([...parsed.nodes.keys()], ['Real']);
    assert.equal(parsed.edges.length, 0);
    assert.equal(DotldParser.hasDotldNotation('```\n::config\n::\n```'), false);
    assert.equal(stripMarkdownCode('a `b` c'), 'a  c');
});

test('property keys stay plain data and cannot pollute object prototypes', () => {
    const parsed = DotldParser.parse('::config\nt: ellipse, #111111, 80\nA: type=t, constructor=y, toString=z, __proto__=x\n::');
    const graph = DotldParser.toGraphData(parsed);
    // "constructor" and "toString" are valid names and kept as data; "__proto__" fails the name rule
    assert.deepEqual(graph.nodes[0].properties, [['constructor', 'y'], ['toString', 'z']]);
    assert.equal(parsed.warnings.length, 1);
    assert.equal(({} as Record<string, unknown>).polluted, undefined);
    assert.equal(Object.getPrototypeOf({}), Object.prototype);
});

test('handles Windows line endings', () => {
    const parsed = DotldParser.parse('::config\r\nt: ellipse, #111111, 80\r\nA: type=t\r\n::\r\n::rel A -> B [x] ::\r\n');
    assert.equal(parsed.nodes.get('A')?.type, 't');
    assert.equal(parsed.edges.length, 1);
});
