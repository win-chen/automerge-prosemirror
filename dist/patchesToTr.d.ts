import { EditorState, Transaction } from "prosemirror-state";
import { next as am } from "@automerge/automerge/slim";
import { SchemaAdapter } from "./schema.js";
export declare function patchesToTr<T>({ adapter, path, before, after, patches, state, }: {
    adapter: SchemaAdapter;
    path: am.Prop[];
    before: am.Doc<T>;
    after: am.Doc<T>;
    patches: am.Patch[];
    state: EditorState;
}): Transaction;
export default patchesToTr;
