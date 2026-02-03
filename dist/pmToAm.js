import { next as automerge } from "@automerge/automerge/slim";
import { pmNodeToSpans, pmRangeToAmRange } from "./traversal.js";
import { amMarksFromPmMarks } from "./schema.js";
export default function (adapter, spans, steps, 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
doc, pmDoc, path) {
    let unappliedMarks = [];
    function flushMarks() {
        if (unappliedMarks.length > 0) {
            applyAddMarkSteps(adapter, spans, unappliedMarks, doc, path);
            unappliedMarks = [];
        }
    }
    for (const step of steps) {
        // console.log(JSON.stringify(step))
        const stepId = step.toJSON()["stepType"];
        if (stepId === "addMark") {
            unappliedMarks.push(step);
            continue;
        }
        else {
            flushMarks();
        }
        oneStep(adapter, spans, stepId, step, doc, pmDoc, path);
        const nextDoc = step.apply(pmDoc).doc;
        if (nextDoc == null) {
            throw new Error("Could not apply step to document");
        }
        pmDoc = nextDoc;
        spans = automerge.spans(doc, path);
    }
    flushMarks();
}
function oneStep(adapter, spans, stepId, step, 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
doc, pmDoc, path) {
    if (stepId === "replace") {
        replaceStep(adapter, spans, step, doc, path, pmDoc);
    }
    else if (stepId === "replaceAround") {
        replaceAroundStep(adapter, step, doc, pmDoc, path);
    }
    else if (stepId === "removeMark") {
        removeMarkStep(adapter, spans, step, doc, path);
    }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function replaceStep(adapter, spans, step, doc, field, pmDoc) {
    if (step.slice.content.childCount === 1 &&
        step.slice.content.firstChild?.isText) {
        // This is a text insertion or deletion
        const amRange = pmRangeToAmRange(adapter, spans, {
            from: step.from,
            to: step.to,
        });
        if (amRange == null) {
            throw new Error(`Could not find range (${step.from}, ${step.to}) in render tree`);
        }
        let { start, end } = amRange;
        if (start > end) {
            // eslint-disable-next-line @typescript-eslint/no-extra-semi
            ;
            [start, end] = [end, start];
        }
        const toDelete = end - start;
        automerge.splice(doc, field, start, toDelete, step.slice.content.firstChild.text);
        const marks = step.slice.content.firstChild.marks;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const length = step.slice.content.firstChild.text.length;
        reconcileMarks(adapter, doc, field, start, length, marks);
        return;
    }
    const applied = step.apply(pmDoc).doc;
    if (applied == null) {
        throw new Error("Could not apply step to document");
    }
    const newSpans = pmNodeToSpans(adapter, applied);
    automerge.updateSpans(doc, field, newSpans, adapter.updateSpansConfig());
}
function replaceAroundStep(adapter, step, 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
doc, pmDoc, field) {
    const applied = step.apply(pmDoc).doc;
    if (applied == null) {
        throw new Error("Could not apply step to document");
    }
    const newSpans = pmNodeToSpans(adapter, applied);
    automerge.updateSpans(doc, field, newSpans, adapter.updateSpansConfig());
}
function applyAddMarkSteps(adapter, spans, steps, doc, field) {
    const marks = steps.map(step => {
        const amRange = pmRangeToAmRange(adapter, spans, {
            from: step.from,
            to: step.to,
        });
        if (amRange == null) {
            throw new Error(`Could not find range (${step.from}, ${step.to}) in render tree`);
        }
        const markName = step.mark.type.name;
        const expand = step.mark.type.spec.inclusive ? "both" : "none";
        const value = markAttrsToMarkValue(step.mark.type, step.mark.attrs);
        return { range: amRange, markName, expand, value };
    });
    const groupedMarks = marks.reduce((acc, mark) => {
        const lastGroup = acc[acc.length - 1];
        if (lastGroup == null) {
            return [mark];
        }
        if (lastGroup.markName === mark.markName &&
            lastGroup.expand === mark.expand &&
            lastGroup.value === mark.value) {
            if (lastGroup.range.end === mark.range.start) {
                lastGroup.range.end = mark.range.end;
                return acc;
            }
            else {
                const spansBetween = spans.slice(lastGroup.range.end, mark.range.start);
                if (spansBetween.every(s => s.type === "block")) {
                    lastGroup.range.end = mark.range.end;
                    return acc;
                }
            }
        }
        acc.push(mark);
        return acc;
    }, []);
    //console.log(groupedMarks)
    for (const mark of groupedMarks) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        automerge.mark(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        doc, field, { start: mark.range.start, end: mark.range.end, expand: mark.expand }, mark.markName, mark.value);
    }
}
function removeMarkStep(adapter, spans, step, doc, field) {
    const amRange = pmRangeToAmRange(adapter, spans, {
        from: step.from,
        to: step.to,
    });
    if (amRange == null) {
        throw new Error(`Could not find range (${step.from}, ${step.to}) in render tree`);
    }
    const { start, end } = amRange;
    if (start == null || end == null) {
        throw new Error(`Could not find step.from (${step.from}) or step.to (${step.to}) in render tree`);
    }
    const markName = step.mark.type.name;
    const expand = step.mark.type.spec.inclusive ? "both" : "none";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    automerge.unmark(doc, field, { start, end, expand }, markName);
}
function reconcileMarks(adapter, doc, path, index, length, marks) {
    const currentMarks = automerge.marksAt(doc, path, index);
    const newMarks = amMarksFromPmMarks(adapter, marks);
    const newMarkNames = new Set(Object.keys(newMarks));
    const currentMarkNames = new Set(Object.keys(currentMarks));
    for (const markName of newMarkNames) {
        if (!currentMarkNames.has(markName) ||
            newMarks[markName] !== currentMarks[markName]) {
            const expand = (marks.find(m => m.type.name === markName)?.type.spec.inclusive ?? true)
                ? "both"
                : "none";
            automerge.mark(doc, path, { start: index, end: index + length, expand }, markName, newMarks[markName]);
        }
    }
    for (const markName of currentMarkNames) {
        const markMapping = adapter.markMappings.find(m => m.automergeMarkName === markName);
        if (markMapping == null) {
            continue;
        }
        if (!newMarkNames.has(markName)) {
            automerge.unmark(doc, path, { start: index, end: index + length, expand: "both" }, markName);
        }
    }
}
function markAttrsToMarkValue(markType, attrs) {
    if (markType.name === "link") {
        return JSON.stringify(attrs);
    }
    else if (markType.name === "strong" ||
        markType.name === "em" ||
        markType.name === "code") {
        return true;
    }
    else {
        // Maybe we should just throw here?
        return true;
    }
}
//# sourceMappingURL=pmToAm.js.map