import { NodeSpec, Schema, MarkSpec, MarkType, Mark, Attrs, NodeType, Node } from "prosemirror-model";
import { next as am } from "@automerge/automerge/slim";
import { BlockMarker } from "./types.js";
type ExpandConfig = "both" | "none";
export interface MappedSchemaSpec {
    nodes: {
        [key: string]: MappedNodeSpec;
    };
    marks?: {
        [key: string]: MappedMarkSpec;
    };
}
export type MappedNodeSpec = NodeSpec & {
    automerge?: {
        unknownBlock?: boolean;
        block?: BlockMappingSpec;
        isEmbed?: boolean;
        attrParsers?: {
            fromProsemirror: (node: Node) => {
                [key: string]: am.MaterializeValue;
            };
            fromAutomerge: (block: BlockMarker) => Attrs;
        };
    };
};
export type BlockMappingSpec = string | {
    within: {
        [key: string]: string;
    };
};
export type MappedMarkSpec = MarkSpec & {
    automerge?: {
        markName: string;
        parsers?: {
            fromAutomerge: (value: am.MarkValue) => Attrs;
            fromProsemirror: (mark: Mark) => am.MarkValue;
        };
    };
};
export type MarkMapping = {
    automergeMarkName: string;
    prosemirrorMark: MarkType;
    parsers: {
        fromAutomerge: (value: am.MarkValue) => Attrs;
        fromProsemirror: (mark: Mark) => am.MarkValue;
    };
};
export type NodeMapping = {
    blockName: string;
    outer: NodeType | null;
    content: NodeType;
    attrParsers?: {
        fromProsemirror: (node: Node) => {
            [key: string]: am.MaterializeValue;
        };
        fromAutomerge: (block: BlockMarker) => Attrs;
    };
    isEmbed?: boolean;
};
export declare class SchemaAdapter {
    nodeMappings: NodeMapping[];
    markMappings: MarkMapping[];
    unknownBlock: NodeType;
    unknownLeaf: NodeType;
    unknownMark: MarkType;
    schema: Schema;
    constructor(spec: MappedSchemaSpec);
    expandConfig(markName: string): ExpandConfig;
    updateSpansConfig(): am.UpdateSpansConfig;
}
export declare function amMarksFromPmMarks(adapter: SchemaAdapter, marks: readonly Mark[]): {
    [key: string]: am.MarkValue;
};
export declare function pmMarksFromAmMarks(adapter: SchemaAdapter, amMarks: am.MarkSet): Mark[];
export {};
