export function isArrayEqual(a, b) {
    if (a.length !== b.length)
        return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i])
            return false;
    }
    return true;
}
export function isPrefixOfArray(prefix, a) {
    if (prefix.length > a.length)
        return false;
    for (let i = 0; i < prefix.length; i++) {
        if (prefix[i] !== a[i])
            return false;
    }
    return true;
}
//# sourceMappingURL=utils.js.map