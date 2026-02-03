import { next as A } from "@automerge/automerge/slim";
export type DocHandle<T> = {
    doc(): T;
    change: (fn: (doc: T) => void) => void;
    on(event: "change", callback: (p: DocHandleChangePayload<T>) => void): void;
    off(event: "change", callback: (p: DocHandleChangePayload<T>) => void): void;
};
export interface DocHandleChangePayload<T> {
    /** The handle that changed */
    handle: DocHandle<T>;
    /** The value of the document after the change */
    doc: A.Doc<T>;
    /** The patches representing the change that occurred */
    patches: A.Patch[];
    /** Information about the change */
    patchInfo: A.PatchInfo<T>;
}
