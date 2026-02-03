import { Step } from "prosemirror-transform";
import { Node } from "prosemirror-model";
import { Prop } from "@automerge/automerge/slim";
import { next as am } from "@automerge/automerge/slim";
import { SchemaAdapter } from "./schema.js";
export type ChangeFn<T> = (doc: T, field: string) => void;
export default function (adapter: SchemaAdapter, spans: am.Span[], steps: Step[], doc: any, pmDoc: Node, path: Prop[]): void;
