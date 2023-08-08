// HSL container, immutable object

class HSLAObj {
    #h = 0;
    #s = 0;
    #l = 50;
    #a = 1;

    constructor(h, s, l, a) {
        this.#h = (h === undefined) ? 0  : h;
        this.#s = (s === undefined) ? 0  : s;
        this.#l = (l === undefined) ? 50 : l;
        this.#a = (a === undefined) ? 1  : a;
    }

    get h() {
        return this.#h;
    }

    get s() {
        return this.#s;
    }

    get l() {
        return this.#l;
    }

    get a() {
        return this.#a;
    }

    toString() {
        return 'hsla(' + this.#h + ', ' + this.#s + '%, ' + this.#l + '%, ' + this.#a + ')';
    }
}

// RGB container, immutable object

class RGBAObj {
    #r = 0;
    #g = 0;
    #b = 0;
    #a = 1;

    constructor(r, g, b, a) {
        this.#r = (r === undefined) ? 0 : r;
        this.#g = (g === undefined) ? 0 : g;
        this.#b = (b === undefined) ? 0 : b;
        this.#a = (a === undefined) ? 1 : a;
    }

    get r() {
        return this.#r;
    }

    get g() {
        return this.#g;
    }

    get b() {
        return this.#b;
    }

    get a() {
        return this.#a;
    }

    toString() {
        return 'rgba(' 
            + Math.round(this.#r) + ', ' 
            + Math.round(this.#g) + ', ' 
            + Math.round(this.#b) + ', ' 
            + this.#a + ')';
    }

}

// HSL/RGB container, immutable object

class ColorObj {
    #hslaObj = new HSLAObj();
    #rgbaObj = new RGBAObj();

    constructor (srcObj) {
        if (srcObj instanceof HSLAObj) {
            this.#hslaObj = srcObj;
            this.#rgbaFromHsla();
        } else if (srcObj instanceof RGBAObj) {
            this.#rgbaObj = srcObj;
        }
    }

    get hsla() {
        return this.#hslaObj;
    }

    static createHSLA(h, s, l, a) {
        return new ColorObj(new HSLAObj(h, s, l, a));
    }

    get rgba() {
        return this.#rgbaObj;
    }

    #rgbaFromHsla () {
        const h = this.#hslaObj.h;
        const s = this.#hslaObj.s / 100;
        const l = this.#hslaObj.l / 100;
        const a = this.#hslaObj.a;

        const k = n => (n + h / 30) % 12;
        const as = s * Math.min(l, 1 - l);
        const f = n =>
          l - as * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
          
        this.#rgbaObj = new RGBAObj(255 * f(0), 255 * f(8), 255 * f(4), a);


    }
}