export const TABLE = {
    riffle: [
        0,
        40,
        90
    ],
    terrain: [
        1.5,
        3,
        5
    ],
    exploded: [
        12,
        28,
        40
    ],
    phosphor: [
        150,
        520,
        1500
    ],
    slow: [
        0.6,
        0.2,
        0.05
    ],
    turntable: [
        200,
        650,
        1500
    ],
    keyboard: [
        1,
        2,
        3.5
    ],
    elevator: [
        40,
        100,
        220
    ],
    phone: [
        16,
        28,
        40
    ],
    laptop: [
        100,
        125,
        150
    ],
    terminal: [
        1,
        2,
        3.5
    ],
    cabinet: [
        1.5,
        3,
        5
    ],
    branches: [
        1,
        3,
        6
    ],
    vault: [
        250,
        600,
        1500
    ],
    lockers: [
        55,
        90,
        120
    ],
    padlock: [
        45,
        90,
        100
    ],
    patch: [
        1,
        2.5,
        5
    ],
    dish: [
        30,
        50,
        70
    ],
    router: [
        0.5,
        1.5,
        3
    ],
    loupe: [
        1.3,
        1.8,
        2.6
    ],
    sieve: [
        6,
        14,
        24
    ],
    rail: [
        1,
        2,
        3.5
    ],
    plug: [
        0.35,
        0.6,
        0.9
    ],
    query: [
        20,
        40,
        55
    ],
    drawer: [
        12,
        22,
        34
    ],
    basket: [
        8,
        16,
        28
    ],
    plot: [
        3,
        6,
        12
    ],
    hub: [
        10,
        16,
        24
    ],
    relay: [
        40,
        120,
        220
    ],
    settle: [
        90,
        120,
        150
    ],
    format: [
        9,
        12,
        14
    ],
    rebuild: [
        8,
        14,
        20
    ],
    stack: [
        22,
        34,
        46
    ]
};
export const DEFAULT = 0.5;
export function intensity(value) {
    const n = typeof value === "string" && value.trim() !== "" ? Number(value) : value;
    if (typeof n !== "number" || !Number.isFinite(n)) return DEFAULT;
    return Math.min(1, Math.max(0, n));
}
export function parameter(figure, value) {
    const [lo, mid, hi] = TABLE[figure];
    const i = intensity(value);
    const v = i <= 0.5 ? lo + i / 0.5 * (mid - lo) : mid + (i - 0.5) / 0.5 * (hi - mid);
    return Math.round(v * 1000) / 1000;
}
