import { ghost, r2 } from "./iso.js";
import { EASE_LIFT, reducedMotion, setReducedMotion } from "./motion.js";
const NS = "http://www.w3.org/2000/svg";
export function mk(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    if (attrs) for(const k in attrs)e.setAttribute(k, String(attrs[k]));
    if (parent) parent.appendChild(e);
    return e;
}
export function solid(parent) {
    const g = mk("g", {}, parent);
    return {
        g,
        sil: mk("path", {
            class: "sil"
        }, g),
        cr: mk("path", {
            class: "nf lo"
        }, g)
    };
}
export const put = (el, s)=>{
    el.sil.setAttribute("d", s.sil);
    el.cr.setAttribute("d", s.crease);
};
export const flatDot = (parent, C, r, cls)=>mk("ellipse", {
        rx: r2(r * C.S),
        ry: r2(r * C.S * C.k),
        class: cls
    }, parent);
export const place = (el, q)=>{
    el.setAttribute("cx", String(r2(q[0])));
    el.setAttribute("cy", String(r2(q[1])));
};
let fid = 0;
export function fade(svg, y0, y1, a0 = 0.7) {
    const id = "hl-fd" + ++fid, defs = mk("defs", {}, svg);
    const lg = mk("linearGradient", {
        id: id + "g",
        gradientUnits: "userSpaceOnUse",
        x1: 0,
        y1: r2(y0),
        x2: 0,
        y2: r2(y1)
    }, defs);
    mk("stop", {
        offset: 0,
        "stop-color": "#fff",
        "stop-opacity": a0
    }, lg);
    mk("stop", {
        offset: 1,
        "stop-color": "#fff",
        "stop-opacity": 0
    }, lg);
    const m = mk("mask", {
        id,
        maskUnits: "userSpaceOnUse",
        x: 0,
        y: 0,
        width: 400,
        height: 320
    }, defs);
    mk("rect", {
        x: 0,
        y: 0,
        width: 400,
        height: 320,
        fill: `url(#${id}g)`
    }, m);
    return `url(#${id})`;
}
export function reflect(svg, parent, P, front, ring, z0, depth) {
    const r = ghost(P, front, ring, z0, depth);
    const gh = mk("g", {
        class: "ghost",
        mask: fade(svg, r.y0, r.y1)
    }, parent);
    mk("path", {
        d: r.d
    }, gh);
}
let boards = [];
const byStage = new Map();
let raf = 0, last = 0;
let io = null;
let rm = null;
function frame() {
    const now = performance.now();
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    let any = false;
    for (const b of boards.slice())if (b.vis && b.awake) {
        try {
            b.awake = !!b.tick(dt, now);
        } catch (err) {
            b.awake = false;
            setTimeout(()=>{
                throw err;
            });
        }
        any = any || b.awake;
    }
    raf = any ? requestAnimationFrame(frame) : 0;
}
function wake(b) {
    b.awake = true;
    if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
    }
}
const onMotion = ()=>{
    setReducedMotion(!!rm?.matches);
    boards.forEach(wake);
};
function start() {
    if (io) return;
    io = new IntersectionObserver((es)=>{
        for (const e of es){
            const set = byStage.get(e.target);
            if (!set) continue;
            for (const b of set){
                b.vis = e.isIntersecting;
                if (b.vis) wake(b);
            }
        }
    }, {
        rootMargin: "80px"
    });
    rm = matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(rm.matches);
    rm.addEventListener("change", onMotion);
}
function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    io?.disconnect();
    io = null;
    rm?.removeEventListener("change", onMotion);
    rm = null;
}
export function register(stage, tick) {
    start();
    const b = {
        stage,
        tick,
        vis: false,
        awake: true
    };
    boards.push(b);
    const peers = byStage.get(stage);
    if (peers) {
        for (const p of peers)b.vis = p.vis;
        peers.add(b);
        if (b.vis) wake(b);
    } else {
        byStage.set(stage, new Set([
            b
        ]));
        io.observe(stage);
    }
    tick(0, performance.now());
    let gone = false;
    return {
        wake: ()=>{
            if (!gone) wake(b);
        },
        unregister: ()=>{
            if (gone) return;
            gone = true;
            boards = boards.filter((x)=>x !== b);
            const set = byStage.get(stage);
            if (set) {
                set.delete(b);
                if (!set.size) {
                    byStage.delete(stage);
                    io?.unobserve(stage);
                }
            }
            if (!boards.length) stop();
        }
    };
}
const handlers = new WeakMap();
const touring = new WeakMap();
export function pointer(stage, on) {
    handlers.set(stage, on);
    let tm = 0;
    const pt = (e)=>{
        const r = stage.getBoundingClientRect();
        return [
            (e.clientX - r.left) / r.width * 400,
            (e.clientY - r.top) / r.height * 320
        ];
    };
    const move = (e)=>{
        clearTimeout(tm);
        touring.get(stage)?.hold();
        on.move(pt(e), e);
    };
    const down = (e)=>{
        clearTimeout(tm);
        touring.get(stage)?.hold();
        if (e.pointerType !== "mouse") stage.releasePointerCapture?.(e.pointerId);
        if (on.down) on.down(pt(e), e);
        else on.move(pt(e), e);
    };
    const leave = (e)=>{
        clearTimeout(tm);
        tm = window.setTimeout(()=>{
            on.leave(e);
            touring.get(stage)?.release();
        }, e.pointerType === "mouse" ? 0 : 1400);
    };
    stage.addEventListener("pointermove", move);
    stage.addEventListener("pointerdown", down);
    stage.addEventListener("pointerleave", leave);
    return ()=>{
        clearTimeout(tm);
        if (handlers.get(stage) === on) handlers.delete(stage);
        stage.removeEventListener("pointermove", move);
        stage.removeEventListener("pointerdown", down);
        stage.removeEventListener("pointerleave", leave);
    };
}
export const LAP = [
    [
        128,
        150
    ],
    [
        200,
        118
    ],
    [
        272,
        150
    ],
    [
        200,
        206
    ],
    null
];
const TRAVEL = 900, DWELL = 1200, REST = 1800, RESUME = 1200, STAGGER = 450;
const GHOST = {
    pointerType: "ghost"
};
let started = 0;
function entry([x, y]) {
    const dx = x - 200, dy = y - 160;
    if (!dx && !dy) return [
        200,
        320
    ];
    const k = Math.min(dx ? (dx > 0 ? 200 : -200) / dx : Infinity, dy ? (dy > 0 ? 160 : -160) / dy : Infinity);
    return [
        200 + dx * k,
        160 + dy * k
    ];
}
export function tour(stage, stops, onStop) {
    let i = 0;
    let wait = RESUME + STAGGER * (started++ % 4);
    let t = -1;
    let at = null;
    let origin = [
        200,
        320
    ];
    let hand = false, keys = stage.contains(stage.ownerDocument.activeElement);
    let gone = false;
    const leave = ()=>{
        at = null;
        t = -1;
        handlers.get(stage)?.leave(GHOST);
    };
    const tick = (dt)=>{
        if (hand || keys || !stops.length) return false;
        if (reducedMotion()) {
            if (at) leave();
            return false;
        }
        if (wait > 0) {
            wait -= dt * 1000;
            return true;
        }
        const stop = stops[i];
        if (stop === null) {
            if (at) leave();
            onStop?.(i);
            i = (i + 1) % stops.length;
            wait = REST;
            return true;
        }
        const h = handlers.get(stage);
        if (!h) return true;
        if (t < 0) {
            origin = at ?? entry(stop);
            t = 0;
        }
        t = Math.min(TRAVEL, t + dt * 1000);
        const k = EASE_LIFT(t / TRAVEL);
        at = [
            origin[0] + (stop[0] - origin[0]) * k,
            origin[1] + (stop[1] - origin[1]) * k
        ];
        h.move(at, GHOST);
        if (t < TRAVEL) return true;
        onStop?.(i);
        i = (i + 1) % stops.length;
        t = -1;
        wait = DWELL;
        return true;
    };
    const take = ()=>{
        at = null;
        t = -1;
    };
    const give = ()=>{
        if (hand || keys) return;
        i = 0;
        t = -1;
        wait = RESUME;
        board.wake();
    };
    const me = {
        hold: ()=>{
            hand = true;
            take();
        },
        release: ()=>{
            if (!hand) return;
            hand = false;
            give();
        }
    };
    const focusIn = ()=>{
        keys = true;
        take();
    };
    const focusOut = (e)=>{
        if (keys && !stage.contains(e.relatedTarget)) {
            keys = false;
            give();
        }
    };
    stage.addEventListener("focusin", focusIn);
    stage.addEventListener("focusout", focusOut);
    touring.set(stage, me);
    const board = register(stage, tick);
    return {
        stop: ()=>{
            if (gone) return;
            gone = true;
            board.unregister();
            stage.removeEventListener("focusin", focusIn);
            stage.removeEventListener("focusout", focusOut);
            if (touring.get(stage) === me) touring.delete(stage);
            if (at) leave();
        }
    };
}
export function disposer() {
    let fns = [];
    return {
        add: (fn)=>{
            fns.push(fn);
        },
        on: (target, type, fn, opts)=>{
            const h = fn;
            target.addEventListener(type, h, opts);
            fns.push(()=>target.removeEventListener(type, h, opts));
        },
        dispose: ()=>{
            const run = fns;
            fns = [];
            for(let i = run.length - 1; i >= 0; i--)run[i]();
        }
    };
}
