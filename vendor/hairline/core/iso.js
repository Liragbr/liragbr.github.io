export const clamp = (v, a, b)=>Math.max(a, Math.min(b, v));
export const lerp = (a, b, t)=>a + (b - a) * t;
export const rad = (d)=>d * Math.PI / 180;
export const r2 = (n)=>Math.round(n * 100) / 100;
export const poly = (pts)=>"M" + pts.map((p)=>r2(p[0]) + " " + r2(p[1])).join("L") + "Z";
export const seg = (a, b)=>`M${r2(a[0])} ${r2(a[1])}L${r2(b[0])} ${r2(b[1])}`;
export const open = (pts)=>pts.length < 2 ? "" : "M" + pts.map((p)=>r2(p[0]) + " " + r2(p[1])).join("L");
export const Cam = (azDeg, k, S)=>({
        az: rad(azDeg),
        k,
        S,
        ox: 0,
        oy: 0
    });
export function proj(C) {
    const c = Math.cos(C.az), s = Math.sin(C.az), zf = Math.sqrt(1 - C.k * C.k);
    return (x, y, z)=>{
        const X = x * c - y * s, Y = x * s + y * c;
        return [
            C.ox + C.S * X,
            C.oy + C.S * (Y * C.k - z * zf)
        ];
    };
}
export function unproj(C, sx, sy, z) {
    const c = Math.cos(C.az), s = Math.sin(C.az), zf = Math.sqrt(1 - C.k * C.k);
    const X = (sx - C.ox) / C.S, Y = ((sy - C.oy) / C.S + z * zf) / C.k;
    return [
        X * c + Y * s,
        -X * s + Y * c
    ];
}
export function fit(C, pts, cx, cy) {
    C.ox = 0;
    C.oy = 0;
    const P = proj(C);
    let a = 1e9, b = -1e9, c = 1e9, d = -1e9;
    for (const p of pts){
        const q = P(p[0], p[1], p[2]);
        a = Math.min(a, q[0]);
        b = Math.max(b, q[0]);
        c = Math.min(c, q[1]);
        d = Math.max(d, q[1]);
    }
    C.ox = cx - (a + b) / 2;
    C.oy = cy - (c + d) / 2;
}
export function rrect(u0, v0, u1, v1, r, n = 4) {
    r = Math.max(0, Math.min(r, (u1 - u0) / 2, (v1 - v0) / 2));
    const out = [];
    for (const [cu, cv, a0] of [
        [
            u1 - r,
            v1 - r,
            0
        ],
        [
            u0 + r,
            v1 - r,
            90
        ],
        [
            u0 + r,
            v0 + r,
            180
        ],
        [
            u1 - r,
            v0 + r,
            270
        ]
    ])for(let k = 0; k <= n; k++){
        const a = rad(a0 + 90 * k / n), ca = Math.cos(a), sa = Math.sin(a);
        out.push({
            u: cu + r * ca,
            v: cv + r * sa,
            nu: ca,
            nv: sa
        });
    }
    return out;
}
export function circ(R, n = 96) {
    const out = [];
    for(let k = 0; k < n; k++){
        const a = k / n * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
        out.push({
            u: R * ca,
            v: R * sa,
            nu: ca,
            nv: sa
        });
    }
    return out;
}
export function hull(input) {
    const pts = input.slice().sort((a, b)=>a[0] - b[0] || a[1] - b[1]);
    const x = (o, a, b)=>(a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], up = [];
    for (const p of pts){
        while(lo.length > 1 && x(lo[lo.length - 2], lo[lo.length - 1], p) <= 0)lo.pop();
        lo.push(p);
    }
    for(let i = pts.length - 1; i >= 0; i--){
        const p = pts[i];
        while(up.length > 1 && x(up[up.length - 2], up[up.length - 1], p) <= 0)up.pop();
        up.push(p);
    }
    lo.pop();
    up.pop();
    return lo.concat(up);
}
export const ringAt = (P, ring, z)=>ring.map((q)=>P(q.u, q.v, z));
export const facing = (C)=>{
    const s = Math.sin(C.az), c = Math.cos(C.az);
    return (q)=>q.nu * s + q.nv * c >= -1e-6;
};
export function run(ring, keep) {
    const n = ring.length;
    let s = -1;
    for(let i = 0; i < n; i++)if (keep(ring[i]) && !keep(ring[(i + n - 1) % n])) {
        s = i;
        break;
    }
    if (s < 0) return keep(ring[0]) ? ring.slice() : [];
    const out = [];
    for(let k = 0; k < n && keep(ring[(s + k) % n]); k++)out.push(ring[(s + k) % n]);
    return out;
}
export function prism(P, front, ring, inner, z0, z1) {
    return {
        sil: poly(hull(ringAt(P, ring, z1).concat(ringAt(P, ring, z0)))),
        crease: inner ? open(ringAt(P, run(inner, front), z1)) : ""
    };
}
export const rings = (x0, y0, x1, y1, r, b)=>[
        rrect(x0, y0, x1, y1, r),
        rrect(x0 + b, y0 + b, x1 - b, y1 - b, Math.max(0.3, r - b))
    ];
export function extremes(P, ring) {
    const pr = ring.map((q)=>P(q.u, q.v, 0));
    let a = 0, b = 0, c = 0;
    pr.forEach((p, k)=>{
        if (p[0] < pr[a][0]) a = k;
        if (p[0] > pr[b][0]) b = k;
        if (p[1] > pr[c][1]) c = k;
    });
    return [
        ring[a],
        ring[b],
        ring[c]
    ];
}
export function fillet(pts, rs, n = 4) {
    const m = pts.length, out = [];
    for(let i = 0; i < m; i++){
        const a = pts[(i + m - 1) % m], p = pts[i], b = pts[(i + 1) % m];
        const la = Math.hypot(a[0] - p[0], a[1] - p[1]), lb = Math.hypot(b[0] - p[0], b[1] - p[1]);
        const t = Math.min(rs[i], la / 2, lb / 2);
        const p1 = [
            p[0] + (a[0] - p[0]) / la * t,
            p[1] + (a[1] - p[1]) / la * t
        ];
        const p2 = [
            p[0] + (b[0] - p[0]) / lb * t,
            p[1] + (b[1] - p[1]) / lb * t
        ];
        for(let k = 0; k <= n; k++){
            const s = k / n, w = 1 - s;
            out.push([
                w * w * p1[0] + 2 * w * s * p[0] + s * s * p2[0],
                w * w * p1[1] + 2 * w * s * p[1] + s * s * p2[1]
            ]);
        }
    }
    return out;
}
export function ghost(P, front, ring, z0, depth) {
    const f = run(ring, front), lowP = ringAt(P, f, z0 - depth);
    return {
        d: open(lowP) + [
            f[0],
            f[f.length - 1]
        ].map((q)=>seg(P(q.u, q.v, z0), P(q.u, q.v, z0 - depth))).join(""),
        y0: Math.min(...ringAt(P, f, z0).map((p)=>p[1])),
        y1: Math.max(...lowP.map((p)=>p[1])) + 2
    };
}
