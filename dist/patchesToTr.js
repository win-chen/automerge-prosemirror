import { next as automerge } from "@automerge/automerge/slim";
import amToPm from "./amToPm.js";
export function patchesToTr({ adapter, path, before, after, patches, state, }) {
    const headsBefore = automerge.getHeads(before);
    const spans = automerge.spans(automerge.view(after, headsBefore), path);
    const tr = amToPm(adapter, spans, patches, path, state.tr);
    tr.setMeta("addToHistory", false); // remote changes should not be added to local stack
    return tr;
}
export default patchesToTr;
//# sourceMappingURL=patchesToTr.js.map