
// projection of a to b, b should be normed
export function prj(a, b) {
    return b.clone().scale(b.dot(a))
}
