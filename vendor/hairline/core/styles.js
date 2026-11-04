const LIGHT = {
    plate: "#ffffff",
    hi: "#232327",
    edge: "#a4a4ac",
    mid: "#c3c3c9",
    lo: "#e0e0e4"
};
const DARK = {
    plate: "#08090a",
    hi: "#d0d6e0",
    edge: "#5b5d64",
    mid: "#3e3e44",
    lo: "#29292d"
};
const KEYS = [
    "plate",
    "hi",
    "edge",
    "mid",
    "lo"
];
const vars = (p)=>KEYS.map((k)=>`--hl-${k}:var(--hairline-${k},${p[k]});`).join("");
const EASE = "cubic-bezier(0.5,0,0.1,1)";
const SVG = ":where([data-hairline]>svg)";
export function css(lightDark) {
    const both = Object.fromEntries(KEYS.map((k)=>[
            k,
            `light-dark(${LIGHT[k]},${DARK[k]})`
        ]));
    return [
        `:where([data-hairline]){display:block;position:relative;aspect-ratio:5/4;touch-action:pan-y;user-select:none;-webkit-user-select:none;--hl-sw:var(--hairline-stroke,0.9);${vars(LIGHT)}}`,
        lightDark ? `:where([data-hairline]){${vars(both)}}` : "",
        `:where(.dark,[data-theme="dark"]) :where([data-hairline]){${vars(DARK)}}`,
        `:where([data-hairline][data-hairline-theme="light"]){${vars(LIGHT)}}`,
        `:where([data-hairline][data-hairline-theme="dark"]){${vars(DARK)}}`,
        `:where([data-hairline]:focus-visible){outline:1.5px solid var(--hl-hi);outline-offset:2px}`,
        `${SVG}{position:absolute;inset:0;width:100%;height:100%;display:block}`,
        `:where([data-hairline]>[data-hairline-live]){position:absolute;width:1px;height:1px;margin:-1px;padding:0;border:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap}`,
        `${SVG} :where(path,polygon,ellipse,line){fill:var(--hl-plate);stroke:var(--hl-mid);stroke-width:var(--hl-sw);vector-effect:non-scaling-stroke;stroke-linejoin:round;stroke-linecap:round;transition:stroke 260ms ${EASE}}`,
        `${SVG} :where(.nf){fill:none}`,
        `${SVG} :where(.fo){stroke:none}`,
        `${SVG} :where(.sil){stroke:var(--hl-edge)}`,
        `${SVG} :where(.hi){stroke:var(--hl-hi)}`,
        `${SVG} :where(.lo){stroke:var(--hl-lo)}`,
        `${SVG} :where(.dash){stroke-dasharray:1 3}`,
        `${SVG} :where(.dot){stroke:none;fill:var(--hl-hi);transition:fill 260ms ${EASE}}`,
        `${SVG} :where(.dot.m){fill:var(--hl-edge)}`,
        `${SVG} :where(.dot.off){fill:var(--hl-lo)}`,
        `${SVG} :where(.ghost path){fill:none;stroke:var(--hl-mid)}`
    ].join("");
}
const done = new WeakSet();
export function inject(root) {
    if (done.has(root)) return;
    done.add(root);
    const doc = root.nodeType === 9 ? root : root.ownerDocument;
    const win = doc.defaultView;
    const text = css(!!win?.CSS?.supports?.("color", "light-dark(#000,#fff)"));
    if (win && "adoptedStyleSheets" in root) {
        try {
            const sheet = new win.CSSStyleSheet();
            sheet.replaceSync(text);
            root.adoptedStyleSheets = [
                ...root.adoptedStyleSheets,
                sheet
            ];
            return;
        } catch  {}
    }
    const style = doc.createElement("style");
    style.setAttribute("data-hairline-style", "");
    style.textContent = text;
    (root.nodeType === 9 ? doc.head ?? doc.documentElement : root).appendChild(style);
}
