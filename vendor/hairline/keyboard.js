// Hairline v0.5.1 by Lucas Marques, MIT. Upstream 37d2e78dcb333ab30c3338e28ed4a690364ea014.
// The upstream vanilla entry point, limited to the Keyboard figure.
import { create } from "./mount.js";
import { mount } from "./figures/keyboard.js";

export function keyboard(element, options) {
    return create({
        id: "keyboard",
        label: "A sixty-key board. The key under the pointer sinks, and its neighbours follow it down, less the further away.",
        rest: "rest",
        engine: mount,
    }, element, options);
}
