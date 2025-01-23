

// Array(n).keys().map(i => i + start)
export function* range(start, end) {
    for (let i = start; i < end; i += 1) yield i;
}

export function* rN(n) { 
    for (let i = 0; i < n; i++) yield i 
}

export function* rMN(m, n) { 
    for (let i = 0; i < m; i++)
        for (let j = 0; j < n; j++) 
            yield [i, j] 
}

export const agri = (v, f, a0 = 0) => rN(v.length).reduce((a, i) => f(a, i), a0)
export const agri1 = (v, f, a0) => rN(v.length-1).reduce((a, i) => f(a, i+1), a0)

const doCi = (v, opi) => v.map(a => opi(a))
const doVi = (v, x, opi) => v.map((a, i) => opi(a, x[i]))
const dooVi = (vs, x, opi) => vs.map( v => doVi(v, x, opi) )
const dooCi = (vs, opi) => vs.map( v => doCi(v, opi) )

export const scale = (v, x) => doVi(v, x, (a, b) => a * b)
export const add = (v, x) => doVi(v, x, (a, b) => a + b)
export const sum = (v, x) => doVi(v, x, (a, b) => a + b)
export const sub = (v, x) => doVi(v, x, (a, b) => a - b)
export const mult = (v, c) => doCi(v, a => a * c)
export const div = (v, c) => doCi(v, a => a / c)
export const dot = (v, c) => agri(v, (a, i) => a + v[i] * c[i])
export const abs = v => doCi(v, a => Math.abs(a))
export const len2 = v => agri(v, (a, i) => a + v[i] * v[i])
export const len = v => Math.sqrt(len2(v))

export const scaleA = (vs, x) => dooVi(vs, x, (a, b) => a * b)
export const addA = (vs, x) => dooVi(vs, x, (a, b) => a + b)
export const subA = (vs, x) => dooVi(vs, x, (a, b) => a - b)
export const divA = (vs, c) => dooCi(vs, a => a / c)

export const normed = v => div(v, len(v))
export const multV = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
export const multS = (v, x) => doVi(v, x, (a, b) => a * b)
export const multC = dot;
export const proj = (a, b) => mult(a, multS(a, b) / len2(a))

export const maxBy = (vs, f) => agri1(vs, (v, i) => { let fi = f(vs[i]); return v[0] < fi ? [fi, i] : v }, [f(vs[0]), 0])
export const minBy = (vs, f) => agri1(vs, (v, i) => { let fi = f(vs[i]); return v[0] > fi ? [fi, i] : v }, [f(vs[0]), 0])

export function sumA(vs) {
    const n = vs[0].length
    let sum = Array(n).fill(0)
    vs.forEach(v => rN(n).forEach(i => sum[i] += v[i]));
    return sum;
}

export function center(vs) { return div(sumA(vs), vs.length); }
