import { next as am } from "@automerge/automerge/slim";
export declare function patchSpans(atPath: am.Prop[], spans: am.Span[], patch: am.Patch): void;
export declare function applyBlockPatch(parentPath: am.Prop[], patch: am.Patch, block: {
    [key: string]: am.MaterializeValue;
}): void;
export declare function findBlockAtCharIdx(spans: am.Span[], charIdx: number): {
    [key: string]: am.MaterializeValue;
} | null;
