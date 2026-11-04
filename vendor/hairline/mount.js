import { inject } from "./core/styles.js";
import { LAP, tour } from "./core/stage.js";
import { parameter } from "./intensity.js";
const NS = "http://www.w3.org/2000/svg";
const mounted = new WeakMap();
const report = (err)=>{
    if (typeof reportError === "function") reportError(err);
    else setTimeout(()=>{
        throw err;
    });
};
export function create(spec, el, options) {
    if (typeof document === "undefined") {
        throw new Error(`hairline: ${spec.id}() needs a DOM. Call it in the browser, once the element exists: in an effect, in onMount, or in a script after the element.`);
    }
    if (!el || el.nodeType !== 1) {
        throw new TypeError(`hairline: ${spec.id}() takes an element as its first argument, and got ${el === null ? "null" : typeof el}.`);
    }
    mounted.get(el)?.();
    const opts = {
        ...options
    };
    const doc = el.ownerDocument;
    const root = el.getRootNode();
    inject(root.nodeType === 9 || "host" in root ? root : doc);
    const owned = new Set();
    const attr = (name, value1)=>{
        if (!owned.has(name) && el.hasAttribute(name)) return;
        if (value1 === null) {
            el.removeAttribute(name);
            owned.delete(name);
        } else {
            el.setAttribute(name, value1);
            owned.add(name);
        }
    };
    const dress = ()=>{
        attr("data-hairline-theme", opts.theme === "light" || opts.theme === "dark" ? opts.theme : null);
        attr("aria-label", el.hasAttribute("aria-labelledby") ? null : typeof opts.label === "string" ? opts.label : spec.label);
    };
    attr("data-hairline", spec.id);
    attr("role", spec.focusable ? "group" : "img");
    if (spec.focusable) attr("tabindex", "0");
    dress();
    const svg = doc.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 400 320");
    svg.setAttribute("aria-hidden", "true");
    el.appendChild(svg);
    let live = null;
    if (spec.focusable) {
        live = doc.createElement("span");
        live.setAttribute("data-hairline-live", "");
        live.setAttribute("aria-live", "polite");
        el.appendChild(live);
    }
    let text = null;
    let playing = null;
    const read = {
        get textContent () {
            return text;
        },
        set textContent (value){
            const next = value ?? "";
            if (next === text) return;
            text = next;
            if (live && live.textContent !== next && (!playing || next === spec.rest || el.matches(":hover, :focus-within"))) live.textContent = next;
            const fn = opts.onRead;
            if (typeof fn === "function") try {
                fn(next);
            } catch (err) {
                report(err);
            }
        }
    };
    let value1 = parameter(spec.id, opts.intensity);
    playing = opts.play === true ? tour(el, spec.tour ?? LAP) : null;
    let engine;
    try {
        engine = spec.engine({
            stage: el,
            svg,
            read
        }, value1);
    } catch (err) {
        playing?.stop();
        throw err;
    }
    if (text === null) read.textContent = spec.rest;
    let dead = false;
    const destroy = ()=>{
        if (dead) return;
        dead = true;
        if (mounted.get(el) === destroy) mounted.delete(el);
        playing?.stop();
        playing = null;
        engine.destroy();
        svg.remove();
        live?.remove();
        for (const name of owned)el.removeAttribute(name);
        owned.clear();
    };
    mounted.set(el, destroy);
    return {
        update (next) {
            if (dead || !next) return;
            const own = opts, given = next;
            for(const k in given){
                if (given[k] === undefined) delete own[k];
                else own[k] = given[k];
            }
            const v = parameter(spec.id, opts.intensity);
            if (v !== value1) {
                value1 = v;
                engine.set(v);
            }
            const play = opts.play === true;
            if (play !== !!playing) {
                playing?.stop();
                playing = play ? tour(el, spec.tour ?? LAP) : null;
            }
            dress();
        },
        destroy
    };
}
