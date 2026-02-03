import { SchemaAdapter } from "./schema.js";
import { next as am } from "@automerge/automerge/slim";
// basics
const pDOM = ["p", 0];
const blockquoteDOM = ["blockquote", 0];
const hrDOM = ["hr"];
const preDOM = ["pre", ["code", 0]];
// marks
const emDOM = ["em", 0];
const strongDOM = ["strong", 0];
const codeDOM = ["code", 0];
// lists
const olDOM = ["ol", 0];
const ulDOM = ["ul", 0];
const liDOM = ["li", 0];
const basicSchema = {
    nodes: {
        /// NodeSpec The top level document node.
        doc: {
            content: "block+",
        },
        /// A plain paragraph textblock. Represented in the DOM
        /// as a `<p>` element.
        paragraph: {
            automerge: {
                block: "paragraph",
            },
            content: "inline*",
            group: "block",
            parseDOM: [{ tag: "p" }],
            toDOM() {
                return pDOM;
            },
        },
        unknownBlock: {
            automerge: {
                unknownBlock: true,
            },
            group: "block",
            content: "block+",
            parseDOM: [{ tag: "div", attrs: { "data-unknown-block": "true" } }],
            toDOM() {
                return ["div", { "data-unknown-block": "true" }, 0];
            },
        },
        /// A blockquote (`<blockquote>`) wrapping one or more blocks.
        blockquote: {
            automerge: {
                block: "blockquote",
            },
            content: "block+",
            group: "block",
            defining: true,
            parseDOM: [{ tag: "blockquote" }],
            toDOM() {
                return blockquoteDOM;
            },
        },
        /// A horizontal rule (`<hr>`).
        horizontal_rule: {
            group: "block",
            parseDOM: [{ tag: "hr" }],
            toDOM() {
                return hrDOM;
            },
        },
        /// A heading textblock, with a `level` attribute that
        /// should hold the number 1 to 6. Parsed and serialized as `<h1>` to
        /// `<h6>` elements.
        heading: {
            automerge: {
                block: "heading",
                attrParsers: {
                    fromAutomerge: block => ({ level: block.attrs.level }),
                    fromProsemirror: node => ({ level: node.attrs.level }),
                },
            },
            attrs: { level: { default: 1 } },
            content: "inline*",
            group: "block",
            defining: true,
            parseDOM: [
                { tag: "h1", attrs: { level: 1 } },
                { tag: "h2", attrs: { level: 2 } },
                { tag: "h3", attrs: { level: 3 } },
                { tag: "h4", attrs: { level: 4 } },
                { tag: "h5", attrs: { level: 5 } },
                { tag: "h6", attrs: { level: 6 } },
            ],
            toDOM(node) {
                return ["h" + node.attrs.level, 0];
            },
        },
        /// A code listing. Disallows marks or non-text inline
        /// nodes by default. Represented as a `<pre>` element with a
        /// `<code>` element inside of it.
        code_block: {
            automerge: {
                block: "code-block",
            },
            content: "text*",
            marks: "",
            group: "block",
            code: true,
            defining: true,
            parseDOM: [{ tag: "pre", preserveWhitespace: "full" }],
            toDOM() {
                return preDOM;
            },
        },
        /// The text node.
        text: {
            group: "inline",
        },
        /// An inline image (`<img>`) node. Supports `src`,
        /// `alt`, and `href` attributes. The latter two default to the empty
        /// string.
        image: {
            automerge: {
                block: "image",
                isEmbed: true,
                attrParsers: {
                    fromAutomerge: (block) => ({
                        src: block.attrs.src?.toString() || null,
                        alt: block.attrs.alt,
                        title: block.attrs.title,
                    }),
                    fromProsemirror: (node) => ({
                        src: new am.ImmutableString(node.attrs.src),
                        alt: node.attrs.alt,
                        title: node.attrs.title,
                    }),
                },
            },
            inline: true,
            attrs: {
                src: {},
                alt: { default: null },
                title: { default: null },
            },
            group: "inline",
            draggable: true,
            parseDOM: [
                {
                    tag: "img[src]",
                    getAttrs(dom) {
                        return {
                            src: dom.getAttribute("src"),
                            title: dom.getAttribute("title"),
                            alt: dom.getAttribute("alt"),
                        };
                    },
                },
            ],
            toDOM(node) {
                const { src, alt, title } = node.attrs;
                return ["img", { src, alt, title }];
            },
        },
        ordered_list: {
            group: "block",
            content: "list_item+",
            attrs: { order: { default: 1 } },
            parseDOM: [
                {
                    tag: "ol",
                    getAttrs(dom) {
                        return {
                            order: dom.hasAttribute("start")
                                ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                                    +dom.getAttribute("start")
                                : 1,
                        };
                    },
                },
            ],
            toDOM(node) {
                return node.attrs.order == 1
                    ? olDOM
                    : ["ol", { start: node.attrs.order }, 0];
            },
        },
        bullet_list: {
            content: "list_item+",
            group: "block",
            parseDOM: [{ tag: "ul" }],
            toDOM() {
                return ulDOM;
            },
        },
        /// A list item (`<li>`) spec.
        list_item: {
            automerge: {
                block: {
                    within: {
                        ordered_list: "ordered-list-item",
                        bullet_list: "unordered-list-item",
                    },
                },
            },
            content: "paragraph block*",
            parseDOM: [{ tag: "li" }],
            toDOM() {
                return liDOM;
            },
            defining: true,
        },
        aside: {
            automerge: {
                block: "aside",
            },
            content: "block+",
            group: "block",
            defining: true,
            parseDOM: [{ tag: "aside" }],
            toDOM() {
                return ["aside", 0];
            },
        },
    },
    marks: {
        /// A link. Has `href` and `title` attributes. `title`
        /// defaults to the empty string. Rendered and parsed as an `<a>`
        /// element.
        link: {
            attrs: {
                href: {},
                title: { default: null },
            },
            inclusive: false,
            parseDOM: [
                {
                    tag: "a[href]",
                    getAttrs(dom) {
                        return {
                            href: dom.getAttribute("href"),
                            title: dom.getAttribute("title"),
                        };
                    },
                },
            ],
            toDOM(node) {
                const { href, title } = node.attrs;
                return ["a", { href, title }, 0];
            },
            automerge: {
                markName: "link",
                parsers: {
                    fromAutomerge: (mark) => {
                        if (typeof mark === "string") {
                            try {
                                const value = JSON.parse(mark);
                                return {
                                    href: value.href || "",
                                    title: value.title || "",
                                };
                            }
                            catch (e) {
                                console.warn("failed to parse link mark as JSON");
                            }
                        }
                        return {
                            href: "",
                            title: "",
                        };
                    },
                    fromProsemirror: (mark) => JSON.stringify({
                        href: mark.attrs.href,
                        title: mark.attrs.title,
                    }),
                },
            },
        },
        /// An emphasis mark. Rendered as an `<em>` element. Has parse rules
        /// that also match `<i>` and `font-style: italic`.
        em: {
            parseDOM: [
                { tag: "i" },
                { tag: "em" },
                { style: "font-style=italic" },
                { style: "font-style=normal", clearMark: m => m.type.name == "em" },
            ],
            toDOM() {
                return emDOM;
            },
            automerge: {
                markName: "em",
            },
        },
        /// A strong mark. Rendered as `<strong>`, parse rules also match
        /// `<b>` and `font-weight: bold`.
        strong: {
            parseDOM: [
                { tag: "strong" },
                // This works around a Google Docs misbehavior where
                // pasted content will be inexplicably wrapped in `<b>`
                // tags with a font-weight normal.
                {
                    tag: "b",
                    getAttrs: (node) => node.style.fontWeight != "normal" && null,
                },
                { style: "font-weight=400", clearMark: m => m.type.name == "strong" },
                {
                    style: "font-weight",
                    getAttrs: (value) => /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null,
                },
            ],
            toDOM() {
                return strongDOM;
            },
            automerge: {
                markName: "strong",
            },
        },
        /// Code font mark. Represented as a `<code>` element.
        code: {
            parseDOM: [{ tag: "code" }],
            toDOM() {
                return codeDOM;
            },
        },
    },
};
export const basicSchemaAdapter = new SchemaAdapter(basicSchema);
//# sourceMappingURL=basicSchema.js.map