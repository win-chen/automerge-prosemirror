import * as am from "@automerge/automerge/slim";
import { Patch, type Prop } from "@automerge/automerge/slim";
import { Transaction } from "prosemirror-state";
import { SchemaAdapter } from "./schema.js";
type SpliceTextPatch = am.SpliceTextPatch;
export default function (adapter: SchemaAdapter, spansAtStart: am.Span[], patches: Array<Patch>, path: Prop[], tx: Transaction): Transaction;
export declare function handleSplice(adapter: SchemaAdapter, spans: am.Span[], patch: SpliceTextPatch, path: Prop[], tx: Transaction): Transaction;
export declare function handleBlockChange(adapter: SchemaAdapter, atPath: am.Prop[], spans: am.Span[], _blockIdx: number, patches: am.Patch[], tx: Transaction): Transaction;
export {};
