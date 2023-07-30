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
        return 'hsla(' + this.#h + ',' + this.#s + '%,' + this.#l + '%,' + this.#a + ')';
    }
}

// HSL/RGB container, immutable object

class ColorObj {
    #hslaObj = new HSLAObj();

    constructor (srcObj) {
        if (srcObj instanceof HSLAObj ) {
            this.#hslaObj = srcObj;
        }
    }

    get hsla() {
        return this.#hslaObj;
    }

    static createHSLA(h, s, l, a) {
        return new ColorObj(new HSLAObj(h, s, l, a));
    }
}