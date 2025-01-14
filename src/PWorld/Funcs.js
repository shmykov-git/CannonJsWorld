
export function prj(a, b) {
    return b.clone().scale(b.dot(a))
}