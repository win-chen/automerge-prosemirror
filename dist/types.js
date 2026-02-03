import * as am from "@automerge/automerge/slim";
export function isBlockMarker(obj) {
    if (obj == null) {
        return false;
    }
    if (typeof obj !== "object") {
        return false;
    }
    if (!("type" in obj)) {
        return false;
    }
    if (!("parents" in obj) || !Array.isArray(obj.parents)) {
        return false;
    }
    if (!validBlockType(obj.type)) {
        return false;
    }
    for (const parent of obj.parents) {
        if (!validBlockType(parent)) {
            return false;
        }
    }
    return true;
}
export function validBlockType(type) {
    if (!am.isImmutableString(type)) {
        return false;
    }
    return [
        "ordered-list-item",
        "unordered-list-item",
        "paragraph",
        "heading",
        "aside",
        "image",
        "blockquote",
    ].includes(type.val);
}
export function blockSpanToBlockMarker(span) {
    const { type: spanType, parents: spanParents, attrs: spanAttrs, isEmbed: spanIsEmbed, } = span;
    let type;
    if (!am.isImmutableString(spanType)) {
        type = new am.ImmutableString("paragraph");
    }
    else {
        type = spanType;
    }
    const attrs = {};
    if (spanAttrs && typeof spanAttrs == "object") {
        for (const [key, value] of Object.entries(spanAttrs)) {
            attrs[key] = value;
        }
    }
    let parents;
    if (!isArrayOfImmutableString(spanParents)) {
        parents = [];
    }
    else {
        parents = spanParents;
    }
    const isEmbed = !!spanIsEmbed;
    return { type, parents, attrs, isEmbed };
}
function isArrayOfImmutableString(obj) {
    if (!Array.isArray(obj)) {
        return false;
    }
    for (const item of obj) {
        if (!am.isImmutableString(item)) {
            return false;
        }
    }
    return true;
}
export function amSpanToSpan(span) {
    if (span.type === "text") {
        return { type: "text", value: span.value, marks: span.marks };
    }
    else {
        return { type: "block", value: blockSpanToBlockMarker(span.value) };
    }
}
//# sourceMappingURL=types.js.map