# DOT-LD Visualization Example

A single-file, browser-based reference implementation of a DOT-LD processor. Edit a DOT-LD markdown document and see it rendered three ways at once:

| Panel | What it shows |
|---|---|
| **Editor** | The DOT-LD source, with syntax highlighting and `[[` autocomplete |
| **Rendered Document** | The markdown as a reader sees it. `::config` and `::rel` are hidden, and `[[Entity]]` references become clickable. |
| **Graph Visualization** | The knowledge graph built from the document, styled by the types in `::config` |

Clicking an entity in the document highlights its node and relationships in the graph, and clicking a node highlights its mentions in the text.

## Running it

Open [`index.html`](index.html) in a modern browser (Chrome, Edge, Firefox or Safari). There's no build step and nothing to install. The page loads three pinned libraries from jsDelivr, so it needs an internet connection.

To serve it locally instead of opening the file directly:

```bash
python3 -m http.server 8000 --bind 127.0.0.1
# then open http://127.0.0.1:8000/
```

Click **✏️ Edit Document** to open the editor. The sample document describes a chiller plant. Replace it with your own DOT-LD markdown, such as any file in [`../`](../).

## Features

- **Live rendering.** The preview and graph update as you type.
- **Autocomplete.** Type `[[` to get suggestions from the entities defined in `::config`. If you select text and type `[[`, it's used as the search term.
- **🔗 Auto-Link Entities.** Wraps plain-text mentions of defined entities in `[[...]]`. For example, "cooling tower" becomes `[[CoolingTower]]`.
- **🔄 Redraw Layout.** Re-runs the force-directed layout. If you drag a node, it keeps its position as you keep editing.
- **Validation.** Problems such as unknown shapes, bad colors, invalid entity names, malformed `::rel` lines or undefined types are logged once to the browser console, prefixed with `DOT-LD:`.

## Supported syntax

The example implements [DOT-LD v1.0](../../docs/syntax-specification.md):

| Feature | Spec | Notes |
|---|---|---|
| `::config` blocks | §3 | Every block is read in document order. Later definitions override earlier ones. |
| Type definitions `type: shape, #RRGGBB, size` | §3.2 | Shapes: `round-rectangle`, `rectangle`, `ellipse`, `circle`, `diamond`. If a value is invalid, the default is used and a warning is logged. |
| Entity assignments `Name: type=t, key=value` | §3.3 | Properties are parsed; values can be quoted with `"…"`. |
| `//` comments | §3.4 | Whole-line or trailing |
| Entity references `[[Name]]` | §4 | Names must start with a letter and contain only letters, digits, `_` or `-`. Invalid references are shown as plain text. |
| Relationships `::rel A -> B [label] ::` | §5 | Supports `->`, `<-` (stored as `B -> A`) and `<->` (drawn with arrowheads on both ends). The label is optional. Exact duplicates are ignored. |
| Code fences and inline code | — | DOT-LD syntax inside code is displayed as text and never parsed, so documents that *show* DOT-LD examples render correctly. |

Limitations:

- The example handles one document at a time. Composing a graph from several files ([`../06-cross-document/`](../06-cross-document/)) is out of scope.
- Entity properties are parsed but not shown in the UI yet.
- Every entity in `::config` appears as a node, even if the text never references it.

## Security design

Documents are untrusted input: DOT-LD is designed to be shared, and people will paste documents they didn't write. The page is built so that a malicious document can't run script.

| Control | How |
|---|---|
| **HTML sanitization** | marked doesn't sanitize HTML, so all preview output passes through [DOMPurify](https://github.com/cure53/DOMPurify) before it reaches the page. Script, event-handler attributes, `javascript:` URLs, forms, styles and similar content are removed. Links open in a new tab with `rel="noopener noreferrer"`. |
| **Entity-name allowlist** | `[[...]]` names must match `^[A-Za-z][\w-]*$` (spec §4.2) and are HTML-escaped as well. The graph looks nodes up with `getElementById` instead of building selector strings. |
| **Subresource Integrity** | Each CDN script is pinned to an exact version and has an `integrity` hash. If the CDN serves different bytes, the browser won't run them. |
| **Content Security Policy** | `default-src 'none'`. Scripts are limited to the three pinned CDN files plus the inline app script, which is matched by its SHA-256 hash. There's no `'unsafe-inline'` or `'unsafe-eval'` for scripts, and no inline event handlers. |
| **Generic error messages** | If rendering fails, the user sees a generic message. Error details go to the console only. |

If a document contains hostile markup, such as an `onerror` attribute, the browser console shows "violates the following Content Security Policy directive" errors. That's expected: DOMPurify removes the markup, and the CSP refuses to run anything left over. A normal document produces no CSP errors.

**Trade-offs:**

- **`style-src 'unsafe-inline'`:** the app and Cytoscape.js set styles from JavaScript. Styles can't run code, and DOMPurify removes style tags and attributes from documents.
- **`img-src https:`:** this lets markdown images load from `https://` URLs. Loading a remote image tells its host that someone viewed the document. To block remote images, change it to `img-src data:`. Relative image paths such as `![](diagram.png)` are blocked, because a pasted document has no base location to resolve them against.

### Hosting

The CSP is set with a `<meta>` tag, so it also works when the file is opened locally. If you host the page, also send these HTTP response headers, which can't be set from `<meta>`:

```
Content-Security-Policy: frame-ancestors 'none'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

## Changing the code

### Editing the inline script

The CSP only allows the inline script whose hash it lists. After you change anything inside the `<script>` block, update the hash:

```bash
python3 update-csp-hash.py          # rewrites the hash in index.html
python3 update-csp-hash.py --check  # exits non-zero if the hash is stale (for CI)
```

If you forget, the page loads but stays empty, and the browser console shows a Content Security Policy error.

### Upgrading a library

1. Change the version in the `<script src>` URL **and** in the CSP `script-src` list.
2. Recompute its integrity hash and replace the `integrity` value:

   ```bash
   curl -s <url> | openssl dgst -sha384 -binary | openssl base64 -A
   ```

3. Check the library's changelog for breaking changes. The example uses `marked.Marked`, `use({ extensions })`, `DOMPurify.sanitize` and `addHook`.

## Third-party libraries

These are loaded at runtime from [jsDelivr](https://www.jsdelivr.com/). None of them are bundled into this repository.

| Library | Version | License | Used for |
|---|---|---|---|
| [Cytoscape.js](https://js.cytoscape.org/) | 3.34.4 | MIT | Graph rendering and layout |
| [marked](https://marked.js.org/) | 18.1.3 | MIT | Markdown parsing |
| [DOMPurify](https://github.com/cure53/DOMPurify) | 3.4.17 | MPL-2.0 OR Apache-2.0 | HTML sanitization |

## License

This example is licensed under MIT-0, like the rest of the repository. See [LICENSE](../../LICENSE).
