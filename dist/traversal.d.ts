import { next as am } from "@automerge/automerge/slim";
import { Node } from "prosemirror-model";
import { BlockMarker } from "./types.js";
import { SchemaAdapter } from "./schema.js";
type RenderRole = "explicit" | "render-only";
export type TraversalEvent = {
    type: "openTag";
    tag: string;
    role: RenderRole;
    attrs?: {
        [key: string]: any;
    };
} | {
    type: "closeTag";
    tag: string;
    role: RenderRole;
} | {
    type: "leafNode";
    tag: string;
    role: RenderRole;
} | {
    type: "text";
    text: string;
    marks: am.MarkSet;
} | {
    type: "block";
    isUnknown?: boolean;
    block: {
        type: string;
        parents: string[];
        attrs: {
            [key: string]: am.MaterializeValue;
        };
        isEmbed: boolean;
    };
};
/**
 * Convert an array of AutoMerge spans into a ProseMirror doc.
 * @param adapter
 * @param spans
 * @returns
 */
export declare function pmDocFromSpans(adapter: SchemaAdapter, spans: am.Span[]): Node;
export declare function amSpliceIdxToPmIdx(adapter: SchemaAdapter, spans: am.Span[], target: number): number | null;
export declare function amIdxToPmBlockIdx(adapter: SchemaAdapter, spans: am.Span[], target: number): number | null;
type Indexes = {
    amIdx: number;
    pmIdx: number;
};
export declare function eventsWithIndexChanges(events: IterableIterator<TraversalEvent>): IterableIterator<{
    event: TraversalEvent;
    before: Indexes;
    after: Indexes;
}>;
export declare function traverseNode(adapter: SchemaAdapter, node: Node): IterableIterator<TraversalEvent>;
export declare function traverseSpans(adapter: SchemaAdapter, amSpans: am.Span[]): IterableIterator<TraversalEvent>;
export declare function pmRangeToAmRange(adapter: SchemaAdapter, spans: am.Span[], { from, to }: {
    from: number;
    to: number;
}): {
    start: number;
    end: number;
} | null;
export declare function blockAtIdx(spans: am.Span[], target: number): {
    index: number;
    block: BlockMarker;
} | null;
export declare function pmNodeToSpans(adapter: SchemaAdapter, node: Node): ({
    type: "block";
    value: {
        type: am.ImmutableString;
        parents: am.ImmutableString[];
        attrs: {
            [key: string]: am.MaterializeValue;
        };
        isEmbed: boolean;
    };
} | {
    type: "text";
    value: string;
    marks?: am.MarkSet;
})[];
export {};
