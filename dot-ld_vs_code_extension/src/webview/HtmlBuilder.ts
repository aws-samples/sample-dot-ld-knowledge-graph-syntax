/**
 * Safe HTML builder using string concatenation
 * Avoids template literal nesting issues
 */

export class HtmlBuilder {
    private parts: string[] = [];

    /**
     * Add raw HTML string
     */
    public add(html: string): HtmlBuilder {
        this.parts.push(html);
        return this;
    }

    /**
     * Add text content (auto-escaped)
     */
    public addText(text: string): HtmlBuilder {
        this.parts.push(HtmlBuilder.escape(text));
        return this;
    }

    /**
     * Add element with attributes and optional content
     */
    public addElement(
        tag: string,
        attributes: Record<string, string> = {},
        content: string = ''
    ): HtmlBuilder {
        let html = '<' + tag;
        
        // Add attributes
        for (const [key, value] of Object.entries(attributes)) {
            html += ' ' + key + '="' + HtmlBuilder.escape(value) + '"';
        }
        
        html += '>';
        
        if (content) {
            html += content; // Content should already be escaped if needed
        }
        
        html += '</' + tag + '>';
        
        this.parts.push(html);
        return this;
    }

    /**
     * Build final HTML string
     */
    public build(): string {
        return this.parts.join('');
    }

    /**
     * Create a new builder
     */
    public static create(): HtmlBuilder {
        return new HtmlBuilder();
    }

    /**
     * Escape HTML special characters
     */
    public static escape(text: string): string {
        const div = { textContent: text };
        // Simple escaping for common cases
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
}
