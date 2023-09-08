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
        return 'hsla(' 
                + Math.round(this.#h) + ', ' 
                + Math.round(this.#s) + '%, ' 
                + Math.round(this.#l) + '%, ' + this.#a.toFixed(2) + ')';
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
            + this.#a.toFixed(2) + ')';
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
            this.#hslaFromRbg();
        }
    }

    mostContrast () {
        const rgba = this.#rgbaObj;
        const toBound = ColorObj.toBound;
        return ColorObj.createRGBA(toBound(rgba.r), toBound(rgba.g),
                                   toBound(rgba.b), rgba.a);
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

    static createRGBA(r, g, b, a) {
        return new ColorObj(new RGBAObj(r, g, b, a));
    }

    #rgbaFromHsla () {
        const {h, s: s100, l: l100, a} = this.#hslaObj;
        const [s, l] = [s100/100, l100/100];

        const k = n => (n + h / 30) % 12;
        const as = s * Math.min(l, 1 - l);
        const f = n =>
          l - as * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
          
        this.#rgbaObj = new RGBAObj(255 * f(0), 255 * f(8), 255 * f(4), a);
    }

    #hslaFromRbg () {
        let {r, g, b, a} = this.#rgbaObj;
        r /= 255;
        g /= 255;
        b /= 255;
        const l = Math.max(r, g, b);
        const s = l - Math.min(r, g, b);
        const h = s 
          ? l === r
            ? (g - b) / s
            : l === g
            ? 2 + (b - r) / s
            : 4 + (r - g) / s
          : 0;

          this.#hslaObj = new HSLAObj(
            60 * h < 0 ? 60 * h + 360 : 60 * h,
            100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0),
            (100 * (2 * l - s)) / 2,
            a            
          );
    }

    static toBound(x) {
        return 255 - x > x ? 255 : 0;
    }
    
}