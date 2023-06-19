/// alert('script start');

const ColorWheel = {
    started: false,
    element: null,
    context2d: null,
    rect: null,
    wheelRadius: 10,
    sliderActive: false,
    centerX: 0,
    centerY: 0,
    sliderX: 0,
    sliderY: 0,
    _hue: 0,
    _saturation: 100,
    _lightness: 50,
    start() {
        if (!this.started) {
            this.element = document.getElementById('ColorWheel');

            // Fix size of the canvas
            this.element.width = this.element.clientWidth;
            this.element.height = this.element.clientHeight;

            this.context2d = this.element.getContext("2d");
            this.getViewPort();
            document.addEventListener('scroll', ()=>ColorWheel.onScroll());

            this.element.addEventListener('mousedown',
                               (event) => {
                                    const x = event.clientX;
                                    const y = event.clientY;
                                    if (this.isInWheel(x, y)) {
                                        this.sliderActivate();
                                        this.sliderMove(x, y);
                                        this.getHueAndSaturation(x, y);
                                        this.draw();
                                        Master.onChangeColorWheel();
                                    }
                               }
            );

            this.element.addEventListener('mousemove', 
                               (event)=> {
                                  const x = event.clientX;
                                  const y = event.clientY;
                                  if (this.sliderActive) {
                                    this.sliderMove(x, y);
                                    this.getHueAndSaturation(x, y);
                                    this.draw();
                                    Master.onChangeColorWheel();
                                  }
                               }
                            );

            this.element.addEventListener('mouseup', 
                            (event)=> {
                                this.sliderDeactivate();
                                this.draw();
                        }
            );

            this.started = true;
        }
    },

    sliderActivate() {
        this.sliderActive = true;
    },

    sliderDeactivate() {
        this.sliderActive = false;
    },

    sliderMove(x, y) {
        if (this.isInWheel(x,y)) {
            this.sliderX = x;
            this.sliderY = y;
        } else {
            const r = this.distance(x, y, this.centerX, this.centerY);
            const k = this.wheelRadius / r;
            this.sliderX = this.centerX + (x - this.centerX) * k;
            this.sliderY = this.centerY + (y - this.centerY) * k;
        }
    },

    distance(x0, y0, x1, y1) {
        const distX = x1 - x0;
        const distY = y1 - y0;
        return Math.sqrt(distX * distX + distY * distY);
    },

    isInWheel (x, y) {
        return this.distance(x, y, this.centerX, this.centerY) <= this.wheelRadius;
    },

    toCanvasX(screenX) {
        return screenX - this.rect.left;
    },

    toCanvasY(screenY) {
        return screenY - this.rect.top;
    },

    sliderReset () {
        const r = this.wheelRadius * this._saturation / 100;
        const hueRad = this._hue * Math.PI / 180;
        const x = this.centerX + r * Math.cos(hueRad);
        const y = this.centerY + r * Math.sin(hueRad);
        this.sliderMove(x, y);
    },
    onScroll() {
        this.getViewPort();
    },
    getViewPort() {
        this.rect = this.element.getBoundingClientRect();
        // this.slider.rect = ColorWheel.slider.element.getBoundingClientRect();

        this.centerX = (this.rect.left + this.rect.right) / 2;
        this.centerY = (this.rect.top + this.rect.bottom) / 2;

        this.wheelRadius = this.rect.height * 0.48;
    },
    getHueAndSaturation(x, y) {
        if (x === this.centerX && y === this.centerY) {
            // the slider is on the center - calculating is impossible
            this._hue = 0;
            this._saturation = 0;
            return;
        }

        let r = this.distance(x, y, this.centerX, this.centerY);

        const sinHue = (y - this.centerY) / r;
        const asinHue = Math.asin(sinHue) * 180 / Math.PI;
        let newHue;
        if (asinHue >= 0) {
            if (x >= this.centerX) {
                newHue = asinHue;
            } else {
                newHue = 180 - asinHue;
            }
        } else {
            if (x >= this.centerX) {
                newHue = 360 + asinHue;
            } else {
                newHue = 180 - asinHue;
            }
        }

        this._hue = newHue;
        this._saturation = Math.min(Math.floor(r * 100 / this.wheelRadius), 100);;
    },

    draw() {
        this.context2d.clearRect(0, 0, this.rect.width, this.rect.height);
        this.drawConicGradient();
        this.drawSlider();
        this.drawHueAngle();
    },

    drawConicGradient() {
        const canvasX = this.toCanvasX(this.centerX);
        const canvasY = this.toCanvasY(this.centerY);
        const grad = this.context2d.createConicGradient(0, canvasX, canvasY);

        for (let angle = 0; angle < 361; angle += 60) {
            const hslColor = `hsl(${angle},100%,${this._lightness}%)`;
            grad.addColorStop(angle/360, hslColor);
        }

        this.context2d.beginPath();
        this.context2d.arc(canvasX, canvasY, this.wheelRadius, 0, 2 * Math.PI);

        this.context2d.fillStyle = grad;
        this.context2d.fill();
    },

    sliderProps: {
        blackRadius: 7,
        blackWidth: 2,
        whiteRadius: 4,
        whiteWidth: 2,
    },

    drawSlider() {
        const canvasX = this.toCanvasX(this.sliderX);
        const canvasY = this.toCanvasY(this.sliderY);

        this.context2d.beginPath();
        this.context2d.arc(canvasX, canvasY, this.sliderProps.blackRadius, 0, 2 * Math.PI);
        this.context2d.lineWidth = this.sliderProps.blackWidth;
        this.context2d.strokeStyle = this.sliderActive ? 'white' : 'black';
        this.context2d.stroke();

        this.context2d.beginPath();
        this.context2d.arc(canvasX, canvasY, this.sliderProps.whiteRadius, 0, 2 * Math.PI);
        this.context2d.lineWidth = this.sliderProps.whiteWidth;
        this.context2d.strokeStyle = this.sliderActive ? 'black' : 'white';
        this.context2d.stroke();
    },

    drawHueAngle() {
        if (this.centerX == this.sliderX && this.centerY == this.sliderY) {
            // the slider is the center
            return;
        }
        const centerX = this.toCanvasX(this.centerX);
        const centerY = this.toCanvasY(this.centerY);

        this.context2d.beginPath();
        this.context2d.lineWidth = 1;
        this.context2d.strokeStyle = 'black';

        this.context2d.moveTo(centerX + this.wheelRadius, centerY);
        this.context2d.lineTo(centerX, centerY);

        const sliderX = this.toCanvasX(this.sliderX);
        const sliderY = this.toCanvasY(this.sliderY);

        const distX = sliderX - centerX;
        const distY = sliderY - centerY;

        const sliderR = Math.sqrt(distX * distX + distY * distY);

        // this.context2d.lineTo(sliderX, sliderY);

        if (sliderR > this.sliderProps.blackRadius) {
            const k = (sliderR - this.sliderProps.blackRadius) / sliderR;
            this.context2d.lineTo(centerX + distX * k, centerY + distY * k);
        }

        this.context2d.stroke();

        if (sliderR < this.wheelRadius - this.sliderProps.blackRadius * 2) {
            this.context2d.beginPath();
            const k1 = (sliderR + this.sliderProps.blackRadius) / sliderR;
            this.context2d.moveTo(centerX + distX * k1, centerY + distY * k1);

            const k2 = this.wheelRadius / sliderR;
            this.context2d.lineTo(centerX + distX * k2, centerY + distY * k2);
            this.context2d.stroke();
        }

        this.context2d.beginPath();
        this.context2d.lineWidth = 3;
        this.context2d.arc(centerX, centerY, this.wheelRadius, 0, this._hue * Math.PI / 180);
        this.context2d.stroke();
    },

    get hue () {
        return Math.floor(this._hue);
    },

    set hue (val) {
        this._hue = val;
        this.sliderReset();
        this.draw();
    },

    get saturation () {
        return this._saturation;
    },

    set saturation (val) {
        this._saturation = val;
        this.sliderReset();
        this.draw();
    }
}  // end of ColorWheel

const Hue = {
    started: false,
    elementText: null,
    invalidText: false,
    rangeControl: null,
    _value: 0,
    start() {
        if (!this.started) {
            this.elementText = document.getElementById('HueText');
            this.rangeControl = new RangeControl(0, 360, 'HueRanger', 'HueSlider', 'HueSliderCenter',
                        () => {
                            this._value =  this.elementText.value = this.rangeControl.value;
                            Master.onChangeHue();
                        }
            );
            this.rangeControl.start();
            this.elementText.addEventListener('input', (event) => Hue.onChangeText());
            this.started = true;
        }
    },
    get value () {
        return this._value;
    },
    set value (val) {
        this._value = this.elementText.value = this.rangeControl.value = val;
        this.invalidText = false;
        unmarkInvalidText(this.elementText);
    },
    onChangeText() {
        const n = parseDecInt(this.elementText.value, 0, 360);
        if (isNaN(n)) {
            this.invalidText = true;
            markInvalidText(this.elementText);
        } else {
            this.invalidText = false;
            unmarkInvalidText(this.elementText);
            this._value = this.rangeControl.value =n;
            Master.onChangeHue();
        }
    }
}  // end of Hue

const Saturation = {
    started: false,
    elementText: null,
    invalidText: false,
    rangeControl: null,
    _value: 100,

    start() {
        if (!this.started) {
            this.elementText = document.getElementById('SaturationText');
            this.elementText.addEventListener('input', (event) => Saturation.onChangeText());
            this.rangeControl = new RangeControl(0, 100, 'SaturRanger', 'SaturSlider', 'SaturSliderCenter',
              () => {
                this._value = this.elementText.value = this.rangeControl.value;
                Master.onChangeSaturation();
              });
            this.rangeControl.start();

            this.started = true;
        }
    },

    get value () {
        return this._value;
    },

    set value (val) {
        this._value = this.elementText.value = this.rangeControl.value = val;
        this.invalidText = false;
        unmarkInvalidText(this.elementText);
    },
    onChangeText() {
        const n = parseDecInt(this.elementText.value, 0, 100);
        if (isNaN(n)) {
            this.invalidText = true;
            markInvalidText(this.elementText);
        } else {
            this.invalidText = false;
            unmarkInvalidText(this.elementText);
            this._value = this.rangeControl.value = n;
            Master.onChangeSaturation();
        }
    }
} // end of Saturation

const Choice = {
    started: false,
    elementChoice: null,
    elementBackground: null,
    _hue: 0,
    _saturation: 100,
    _lightness: 50,
    _alpha: 1,

    start() {
        if (!this.started) {
            this.elementChoice = document.getElementById('Choice');
            this.elementBackground = document.getElementById('Background');

            this.started = true;
        }
    },

    get hue() {
        return this._hue;
    },

    set hue (val) {
        this._hue = val;
        this.updateChoice();
    },

    get saturation () {
        return this._saturation;
    },

    set saturation (val) {
        this._saturation = val;
        this.updateChoice();
    },

    get lightness () {
        return this._lightness;
    },

    set lightness (val) {
        this._lightness = val;
        this.updateChoice();
    },

    get alpha () {
        return this._alpha;
    },

    set alpha (val) {
        this._alpha = val;
    },

    updateChoice() {
        const s = 'hsla(' + this._hue + ',' + this._saturation + '%,' + this._lightness + '%,' + this._alpha + ')';
        this.elementChoice.style.backgroundColor = s;
    }


}  // end of Choice

const Init = {
    hue: 45,
    saturation: 50
}

const Master = {
    started: false,
    start() {
        if (!this.started) {
            ColorWheel.start();
            Hue.start();
            Saturation.start();
            Choice.start();

            ColorWheel.hue = Choice._hue = Hue.value =Init.hue;
            ColorWheel.saturation = Choice.saturation = Saturation.value = Init.saturation;

            this.started = true;
        }
    },

    onChangeColorWheel () {
        Hue.value = Choice.hue = ColorWheel.hue;
        Saturation.value = Choice.saturation = ColorWheel.saturation;
    },

    onChangeHue () {
        ColorWheel.hue = Choice.hue = Hue.value;
    },

    onChangeSaturation () {
        ColorWheel.saturation = Choice.saturation = Saturation.value;
    }
} // end of Master

const simpleDecInt = /^\s*[\+\-]?[0-9]*$/;

function parseDecInt(text, min, max) {
    if (!simpleDecInt.test(text)) {
        return NaN;
    }

    const val = parseInt(text, 10);
    if (isNaN(val) || val < min || val > max) {
        return NaN;
    } else {
        return val;
    }
}

function markInvalidText(element) {
    element.style.textDecorationLine = 'line-through';
    element.style.textDecorationColor = 'red';
}

function unmarkInvalidText(element) {
    element.style.textDecorationLine = 'none';
}

function RangeControl (min, max, id, idSlider, idCenter, onChange) {
    const control = {
        started: false,
        min: min,
        max, max,
        onChange: onChange,
        id: id,
        idSlider: idSlider,
        idCenter: idCenter,

        _value: 0,

        element: null,
        elementSlider: null,
        elementCenter: null,

        rect: null,
        rectSlider: null,

        sliderActivate: false,

        start() {
            if( !this.started ) {
                this.element = document.getElementById(this.id);
                this.elementSlider = document.getElementById(this.idSlider);
                this.elementCenter = document.getElementById(this.idCenter);
                this.getViewPort();
                this.element.addEventListener('mousedown',
                   (event)=> {
                      this.sliderActivate();
                      this.sliderMove(event.clientX);
                      this.getValue(event.clientX);
                      this.onChange();
                   });

                   this.element.addEventListener('mousemove', 
                   (event)=> {
                      if (this.sliderActive) {
                        this.sliderMove(event.clientX);
                        this.getValue(event.clientX);
                        this.onChange();
                    }
                   });

                   this.element.addEventListener('mouseup', 
                   (event)=> {
                      this.sliderDeactivate();
                   });


                this.started = true;
            }
        },

        getViewPort() {
            this.rect = this.element.getBoundingClientRect();
            this.rectSlider = this.elementSlider.getBoundingClientRect();

        },

        sliderMove(x) {
            let left = x - this.rect.left - this.rectSlider.width / 2;
            left = Math.max(left, 0);
            left = Math.min(left, this.rect.width - this.rectSlider.width);

            this.elementSlider.style.left = left;
        },

        sliderActivate() {
            this.sliderActive = true;
            this.elementCenter.setAttribute('stroke', '#FFF');
        },
    
        sliderDeactivate() {
            this.sliderActive = false;
            this.elementCenter.setAttribute('stroke', '#000');
        },

        getValue(x) {
            const workLength = this.rect.width - this.rectSlider.width;
            const posX = x - this.rect.left - this.rectSlider.width / 2;
            let val = this.min + posX/workLength * (this.max - this.min);
            val = Math.max(val, this.min);
            val = Math.min(val, this.max);
            this._value = Math.floor(val);
        },

        sliderReset() {
            const workLength = this.rect.width - this.rectSlider.width;
            const x = this.rect.left + this.rectSlider.width / 2 + (this._value - this.min) / (this.max - this.min) * workLength;
            this.sliderMove(x);
        },

        get value() {
            return this._value;
        },

        set value(val) {
            this._value = val;
            this.sliderReset();
        }
    }

    return control;
}  // end of RangeControl

Master.start();

 /// alert('script finish');
