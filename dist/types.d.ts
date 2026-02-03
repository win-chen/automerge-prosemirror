import * as am from "@automerge/automerge/slim";
export interface DocHandle<T> {
    docSync: () => am.Doc<T> | undefined;
    change: (fn: am.ChangeFn<T>) => void;
}
export type BlockType = string;
export declare function isBlockMarker(obj: unknown): obj is BlockMarker;
export declare function validBlockType(type: unknown): type is BlockType;
export type BlockMarker = {
    type: am.ImmutableString;
    parents: am.ImmutableString[];
    attrs: {
        [key: string]: am.MaterializeValue;
    };
    isEmbed?: boolean;
};
export declare function blockSpanToBlockMarker(span: {
    [key: string]: am.MaterializeValue;
}): BlockMarker;
export type Span = {
    type: "text";
    value: string;
    marks?: am.MarkSet;
} | {
    type: "block";
    value: BlockMarker;
};
export declare function amSpanToSpan(span: am.Span): Span;
