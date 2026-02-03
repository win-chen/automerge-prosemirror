import * as am from "@automerge/automerge/slim";
import { SchemaAdapter } from "./schema.js";
import { DocHandle } from "./DocHandle.js";
export declare const syncPluginKey: any;
export declare const syncPlugin: <T>({ adapter, handle, path, }: {
    adapter: SchemaAdapter;
    handle: DocHandle<T>;
    path: am.Prop[];
}) => any;
