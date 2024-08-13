
/// alert('script start');

const AngleProps = {
    arrowWidth: 5,
    arrowHeight: 14,
    rayWidth: 2,
    arcWidth: 2,

    lightColor: 'white',
    darkColor: 'black'
}

const SliderProps = {
    radius1: 6,
    width1: 2,
    radius2: 3,
    width2: 1,
}

const ColorWheelProps = {
    hueFont:        'bold {font-size}px Arial serif',
    saturationFont: 'bold {font-size}px Arial serif',
    saturationTextMargin: 0.3,
    wheelR: 0.38,
    fontSize: 0.03
}

const ColorWheel = {
    started: false,
    element: null,
    context2d: null,
    rect: null,
    wheelR: 10,
    sliderR: 5,
    sliderActive: false,
    centerX: 0,
    centerY: 0,
    _hue: 0,
    _saturation: 100,
    _lightness: 50,
    start() {
        if (!this.started) {
            this.element = document.getElementById('ColorWheel');

            this.setupViewPort();

            document.addEventListener('scroll', ()=>this.onScroll());
            window.addEventListener('resize', ()=>this.onResize());
            
            this.element.addEventListener('mousedown',
                               (event) => {
                                    const x = event.clientX;
                                    const y = event.clientY;
                                    if (this.isInWheel(x, y)) {
                                        this.sliderActivate();
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
                                    this.getHueAndSaturation(x, y);
                                    this.draw();
                                    Master.onChangeColorWheel();
                                  }
                               }
                            );

            const deactivateHandler = (eventName) => {
                this.element.addEventListener(eventName, 
                    () => {
                        this.sliderDeactivate();
                        this.draw();
                    }
            )};                
            ['mouseup', 'mouseleave'].forEach(
                // the same handler for the a few events
                deactivateHandler        

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

    distance(x0, y0, x1, y1) {
        const distX = x1 - x0;
        const distY = y1 - y0;
        return Math.sqrt(distX * distX + distY * distY);
    },

    isInWheel (x, y) {
        return this.distance(x, y, this.centerX, this.centerY) <= this.wheelR;
    },

    toCanvasX(screenX) {
        return screenX - this.rect.left;
    },

    toCanvasY(screenY) {
        return screenY - this.rect.top;
    },

    sliderReset () {
        this.sliderR = this.wheelR * this._saturation / 100;
    },

    onScroll() {
        this.setupViewPort();
        this.draw();
    },

    onResize() {
        this.setupViewPort();
        this.draw();
    },

    setupViewPort() {
        this.rect = this.element.getBoundingClientRect();

        // Fix size of the canvas
        this.element.width = this.rect.width;
        this.element.height = this.rect.height;

        this.context2d = this.element.getContext("2d");

        this.centerX = (this.rect.left + this.rect.right) / 2;
        this.centerY = (this.rect.top + this.rect.bottom) / 2;

        this.wheelR = this.rect.height * ColorWheelProps.wheelR;

        this.sliderReset();
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
        this._saturation = Math.min(r * 100 / this.wheelR, 100);
        this.sliderR = Math.min(r, this.wheelR);
    },

    draw() {
        this.context2d.clearRect(0, 0, this.rect.width, this.rect.height);
        this.drawConicGradient();
        this.drawHueAngle();
        this.drawHueText();
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
        this.context2d.arc(canvasX, canvasY, this.wheelR, 0, 2 * Math.PI);

        this.context2d.fillStyle = grad;
        this.context2d.fill();
    },

    drawSlider() {  // rotated with ray 2
        const centerX = this.toCanvasX(this.centerX);
        const centerY = this.toCanvasY(this.centerY);
        const sliderX = centerX + this.sliderR;
        
        const color1 = this._lightness < 50 ? AngleProps.lightColor : AngleProps.darkColor;
        const color2 = this._lightness >= 50 ? AngleProps.lightColor : AngleProps.darkColor;


        this.context2d.beginPath();
        this.context2d.arc(sliderX, centerX, SliderProps.radius1, 0, 2 * Math.PI);
        this.context2d.lineWidth = SliderProps.width1;
        this.context2d.strokeStyle = this.sliderActive ? color2 : color1;
        this.context2d.stroke();

        this.context2d.beginPath();
        this.context2d.arc(sliderX, centerX, SliderProps.radius2, 0, 2 * Math.PI);
        this.context2d.lineWidth = SliderProps.width2;
        this.context2d.strokeStyle = this.sliderActive ? color1 : color2;
        this.context2d.stroke();
    },
    
    drawHueAngle() {
        const ctx = this.context2d;
        ctx.save();

        const lineColor = this._lightness < 50 ? AngleProps.lightColor : AngleProps.darkColor;
        const centerX = this.toCanvasX(this.centerX);
        const centerY = this.toCanvasY(this.centerY);

        ctx.lineWidth = AngleProps.rayWidth;
        ctx.strokeStyle = lineColor;
        
        ctx.beginPath(); // ray 1 (unmovable)

        ctx.moveTo(centerX + this.wheelR - AngleProps.arrowHeight, centerY);
        ctx.lineTo(centerX, centerY);
        ctx.stroke();

        ctx.fillStyle = lineColor;
        ctx.beginPath();  // arrow 1
        ctx.moveTo(centerX + this.wheelR, centerY);
        ctx.lineTo(centerX + this.wheelR - AngleProps.arrowHeight, 
                                centerY + AngleProps.arrowWidth);
        ctx.lineTo(centerX + this.wheelR - AngleProps.arrowHeight, 
                                centerY - AngleProps.arrowWidth);
        ctx.fill();
       
        const sliderR = this.sliderR;

        // rotation of the movable ray

        ctx.translate(centerX, centerY);
        ctx.rotate(this._hue * Math.PI / 180);
        ctx.translate(-centerX, -centerY);

        ctx.beginPath();      // ray 2 (movable)
        let x = centerX;
        let y = centerY;

        if (sliderR < SliderProps.radius1) {
            // the slider is close to the center of the wheel
            x = centerX + sliderR + SliderProps.radius1;
            ctx.moveTo(x, y);
            x = centerX + this.wheelR;
            ctx.lineTo(x, y);
        } else {
            ctx.moveTo(x, y);
            x = centerX + sliderR - SliderProps.radius1;
            ctx.lineTo(x, y);
            if (sliderR + SliderProps.radius1 < this.wheelR) {
                // the slider is inside the wheel
                x = centerX + sliderR + SliderProps.radius1;
                ctx.moveTo(x, y);
                x = centerX + this.wheelR;
                ctx.lineTo(x, y);
            }

        }
        ctx.stroke();

        if (sliderR + SliderProps.radius1 < this.wheelR) {
            // draw arrow 2
            const k = Math.min(this.wheelR - sliderR - SliderProps.radius1, AngleProps.arrowHeight)/AngleProps.arrowHeight;
            const arrowHeight = AngleProps.arrowHeight * k;
            const arrowWidth = AngleProps.arrowWidth * k;
            ctx.beginPath();  
            ctx.moveTo(centerX + this.wheelR, centerY);
            ctx.lineTo(centerX + this.wheelR - arrowHeight, centerY + arrowWidth);
            ctx.lineTo(centerX + this.wheelR - arrowHeight, centerY - arrowWidth);
            ctx.fill();
        }

        this.drawSlider();
        this.drawSaturationText(lineColor);

        ctx.restore()

        // draw the arc
        ctx.beginPath();
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = AngleProps.arcWidth;
        ctx.arc(centerX, centerY, this.wheelR, 0, this._hue * Math.PI / 180);
        ctx.stroke();


    },

    drawHueText() {
        const ctx = this.context2d;
        const text = ` H=${this._hue.toFixed()}\xB0 `;
        ctx.font = ColorWheelProps.hueFont.replace("{font-size}", 
                                    this.rect.height * ColorWheelProps.fontSize);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'black';
        const metrics = ctx.measureText(text);
        const width = metrics.width 
                        + SliderProps.radius1; // avoid ovelapping with the slider
        const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
        const r = Math.sqrt(width*width + height*height) / 2;
        const hueRad = this._hue * Math.PI / 180;

        const wheelR = this.wheelR + r;
        const x = this.toCanvasX(this.centerX + wheelR * Math.cos(hueRad));
        const y = this.toCanvasY(this.centerY + wheelR * Math.sin(hueRad)); 
        ctx.fillText(text, x, y);
    },

    drawSaturationText(color) {  // rotated with ray 2
        const ctx = this.context2d;
        const text = `S=${this._saturation.toFixed()}%`;
        ctx.font = ColorWheelProps.saturationFont.replace("{font-size}", this.rect.height * ColorWheelProps.fontSize);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = color;
        const metrics = ctx.measureText(text);
        const width = metrics.width;
        const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
        const margin = height * ColorWheelProps.saturationTextMargin;
        const centerX = this.toCanvasX(this.centerX);
        const centerY = this.toCanvasY(this.centerY);
        const leftFromSlider = (width + 4 * margin) < this.sliderR;
        const aboveRay = this._hue > 90;
        const turnOverText = this._hue > 90 && this.hue < 270;
        const x = leftFromSlider 
                        // text is left from the slider
                        ? centerX + this.sliderR - SliderProps.radius1 - 
                            margin - width/2
                        // text is right from the slider
                        : centerX + this.sliderR + SliderProps.radius1 + 
                            margin + width/2;
        const y = aboveRay 
                        // text is above ray 2
                        ? centerY - margin - height / 2
                        // text is below ray 2
                        : centerY + margin + height / 2;           

        if (turnOverText) {
            // turn the text over
            ctx.save();
            const rotateX = x;
            const rotateY = centerY;

            ctx.translate(rotateX, rotateY);
            ctx.rotate(Math.PI);
            ctx.translate(-rotateX, -rotateY); 
        }

        ctx.fillText(text, x, y);
 
        if (turnOverText) {
            ctx.restore();
        }

    },

    get hue () {
        return this._hue;
    },

    set hue (val) {
        this._hue = val;
        this.draw();
    },

    get saturation () {
        return this._saturation;
    },

    set saturation (val) {
        this._saturation = val;
        this.sliderReset();
        this.draw();
    },
    
    get lightness () {
        return this._lightness;
    },

    set lightness (val) {
        this._lightness = val;
        this.draw();
    },

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
            this.rangeControl = new RangeControl(0, 1, 360, 'HueRanger', 'HueSlider', 'HueSliderCenter',
                        () => {
                            this._value = this.rangeControl.value;
                            this.elementText.value = this._value.toFixed();
                            unmarkInvalidText(this.elementText);
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
        this._value = this.rangeControl.value = val;
        this.elementText.value = val.toFixed();
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
            this.rangeControl = new RangeControl(0, 1, 100, 'SaturRanger', 'SaturSlider', 'SaturSliderCenter',
              () => {
                this._value = this.rangeControl.value;
                this.elementText.value = this._value.toFixed();
                unmarkInvalidText(this.elementText);
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
        this._value = this.rangeControl.value = val;
        this.elementText.value = val.toFixed();
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

const Lightness = {
    started: false,
    elementText: null,
    invalidText: false,
    rangeControl: null,
    _value: 50,
    start() {
        if (!this.started) {
            this.elementText = document.getElementById('LightText');
            this.elementText.addEventListener('input', () => this.onChangeText());
            this.rangeControl = new RangeControl(0, 1, 100, 'LightRanger', 'LightSlider', 'LightSliderCenter',
              () => {
                this._value = this.rangeControl.value;
                this.elementText.value = this._value.toFixed();
                unmarkInvalidText(this.elementText);
                Master.onChangeLightness();
              });
            this.rangeControl.start();

            this.started = true;
        }
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
            Master.onChangeLightness();
        }
    },

    get value () {
        return this._value;
    },

    set value (val) {
        this._value = this.rangeControl.value = val;
        this.elementText.value = val.toFixed();
        this.invalidText = false;
        unmarkInvalidText(this.elementText);
    },

} // end of Lightness

const Alpha = {
    started: false,
    elementText: null,
    invalidText: false,
    rangeControl: null,
    _value: 0.5,
    start() {
        if (!this.started) {
            this.elementText = document.getElementById('AlphaText');
            this.elementText.addEventListener('input', (event) => this.onChangeText());
            this.rangeControl = new RangeControl(0, 0.01, 1, 'AlphaRanger', 
                'AlphaSlider', 'AlphaSliderCenter',
                () => {
                    this._value = this.rangeControl.value;
                    this.elementText.value = this._value.toFixed(2)
                    unmarkInvalidText(this.elementText);
                    Master.onChangeAlpha();
                });
            this.rangeControl.start();

            this.started = true;
        }
    },
    onChangeText() {
        const n = parseDecFloat(this.elementText.value, 0, 1);
        if (isNaN(n)) {
            this.invalidText = true;
            markInvalidText(this.elementText);
        } else {
            this.invalidText = false;
            unmarkInvalidText(this.elementText);
            this._value = this.rangeControl.value = n;
            Master.onChangeAlpha();
        }
    },

    get value () {
        return this._value;
    },

    set value (val) {
        this._value = this.rangeControl.value = val;
        this.elementText.value = val.toFixed(2);
        this.invalidText = false;
        unmarkInvalidText(this.elementText);
    }
} // end of Alpha

const Red = {
    started: false,
    elementText: null,
    invalidText: false,
    rangeControl: null,
    _value: 128,

    start() {
        if (!this.started) {
            this.elementText = document.getElementById('RedText');
            this.elementText.addEventListener('input', (event) => this.onChangeText());
            this.rangeControl = new RangeControl(0, 1, 255, 'RedRanger', 'RedSlider', 'RedSliderCenter',
              () => {
                this._value = this.rangeControl.value;
                this.elementText.value = this._value.toFixed();
                unmarkInvalidText(this.elementText);
                Master.onChangeRed();
              });
            this.rangeControl.start();

            this.started = true;
        }
    },

    get value () {
        return this._value;
    },

    set value (val) {
        this._value = this.rangeControl.value = val;
        this.elementText.value = val.toFixed();
        this.invalidText = false;
        unmarkInvalidText(this.elementText);
    },
    onChangeText() {
        const n = parseDecInt(this.elementText.value, 0, 255);
        if (isNaN(n)) {
            this.invalidText = true;
            markInvalidText(this.elementText);
        } else {
            this.invalidText = false;
            unmarkInvalidText(this.elementText);
            this._value = this.rangeControl.value = n;
            Master.onChangeRed();
        }
    }
} // end of Red

const Green = {
    started: false,
    elementText: null,
    invalidText: false,
    rangeControl: null,
    _value: 128,

    start() {
        if (!this.started) {
            this.elementText = document.getElementById('GreenText');
            this.elementText.addEventListener('input', (event) => this.onChangeText());
            this.rangeControl = new RangeControl(0, 1, 255, 'GreenRanger', 'GreenSlider', 'GreenSliderCenter',
              () => {
                this._value = this.rangeControl.value;
                this.elementText.value = this._value.toFixed();
                unmarkInvalidText(this.elementText);
                Master.onChangeGreen();
              });
            this.rangeControl.start();

            this.started = true;
        }
    },

    get value () {
        return this._value;
    },

    set value (val) {
        this._value = this.rangeControl.value = val;
        this.elementText.value = val.toFixed();
        this.invalidText = false;
        unmarkInvalidText(this.elementText);
    },
    onChangeText() {
        const n = parseDecInt(this.elementText.value, 0, 255);
        if (isNaN(n)) {
            this.invalidText = true;
            markInvalidText(this.elementText);
        } else {
            this.invalidText = false;
            unmarkInvalidText(this.elementText);
            this._value = this.rangeControl.value = n;
            Master.onChangeGreen();
        }
    }
} // end of Green

const Blue = {
    started: false,
    elementText: null,
    invalidText: false,
    rangeControl: null,
    _value: 128,

    start() {
        if (!this.started) {
            this.elementText = document.getElementById('BlueText');
            this.elementText.addEventListener('input', (event) => this.onChangeText());
            this.rangeControl = new RangeControl(0, 1, 255, 'BlueRanger', 'BlueSlider', 'BlueSliderCenter',
              () => {
                this._value = this.rangeControl.value;
                this.elementText.value = this._value.toFixed();
                unmarkInvalidText(this.elementText);
                Master.onChangeBlue();
              });
            this.rangeControl.start();

            this.started = true;
        }
    },

    get value () {
        return this._value;
    },

    set value (val) {
        this._value = this.rangeControl.value = val;
        this.elementText.value = val.toFixed();
        this.invalidText = false;
        unmarkInvalidText(this.elementText);
    },
    onChangeText() {
        const n = parseDecInt(this.elementText.value, 0, 255);
        if (isNaN(n)) {
            this.invalidText = true;
            markInvalidText(this.elementText);
        } else {
            this.invalidText = false;
            unmarkInvalidText(this.elementText);
            this._value = this.rangeControl.value = n;
            Master.onChangeBlue();
        }
    }
} // end of Blue



const HSLAText = {
    started: false,
    elementText: null,
    invalidText: false,
    _color: null,

    start() {
        if (!this.started) {
            this.elementText = document.getElementById('HSLAText');
            this.elementText.addEventListener('input', (event) => this.onChangeText());
            this._color = ColorObj.createHSLA();

            this.started = true;
        }
    },

    onChangeText() {
        const res = parseHSLA(this.elementText.value);
        if (res === null) {
            this.invalidText = true;
            markInvalidText(this.elementText);
        } else {
            this._color = res;
            this.invalidText = false;
            unmarkInvalidText(this.elementText);
            Master.onChangeHSLAText();
        }
    },

    get color () {
        return this._color;
    },

    set color (val) {
        this._color = val;
        this.elementText.value = this._color.hsla.toString();
        this.invalidText = false;
        unmarkInvalidText(this.elementText);
    }


} // end of HSLAText

const RGBAText = {
    started: false,
    elementText: null,
    invalidText: false,
    _color: null,

    start() {
        if (!this.started) {
            this.elementText = document.getElementById('RGBAText');
            this.elementText.addEventListener('input', (event) => this.onChangeText());
            this._color = ColorObj.createRGBA();

            this.started = true;
        }
    },

    onChangeText() {
        const res = parseRGBA(this.elementText.value);
        if (res === null) {
            this.invalidText = true;
            markInvalidText(this.elementText);
        } else {
            this._color = res;
            this.invalidText = false;
            unmarkInvalidText(this.elementText);
            Master.onChangeRGBAText();
        }
    },

    get color () {
        return this._color;
    },

    set color (val) {
        this._color = val;
        this.elementText.value = this._color.rgba.toString();
        this.invalidText = false;
        unmarkInvalidText(this.elementText);
    }
} // end of RGBAText

const ChoiceProps = {
    squareSide: 0.75,
    squareIdent: 0.05,
    cornerR: 0.05,
    borderWidth: 2,
    borderStyle: 'white',
    bacgroundBorderStyle: 'white',
    bacgroundColor: 'black',
    borderDash: [1, 0],
    tailMargin: 0.007,
    tailRowSize: 5,
    tailCornerR: 0.02,

    triangleSide: 0.2,
    circleR: 0.3,
    circleBorder: 15,

    // colorTitle: "Chosen Color",
    colorFont:  "bold {font-size}px Arial serif",
    colorMinFontSize: 0.04,
    colorMaxFontSize: 0.13,
    rbgTitleShift: 2.8 
}

const Choice = {
    started: false,
    element: null,
    context2d: null,
    rect: null,
    _hue: 0,
    _saturation: 100,
    _lightness: 50,
    _alpha: 1,
    _color: null,

    redCenterX: 0,
    redCenterY: 0,
    redCirclePath: null,
    greenCenterX: 0,
    greenCenterY: 0,
    greenCirclePath: null,
    blueCenterX: 0,
    blueCenterY: 0,
    blueCirclePath: null,
    circleR: 0,

    start() {
        if (!this.started) {
            this.element = document.getElementById('Choice');

            this.setupViewPort();

            document.addEventListener('scroll', ()=>this.onScroll());
            window.addEventListener('resize', ()=>this.onResize());

            this.started = true;
        }
    },

    get color() {
        return this._color;
    },

    set color(val) {
        this._color = val;
        this.draw();
    },

    setupViewPort() {
        this.rect = this.element.getBoundingClientRect();
        
        // Fix size of the canvas

        this.element.width = this.rect.width;
        this.element.height = this.rect.height;
        
        this.context2d = this.element.getContext("2d");

        this.setupCenters();
    },

    setupCenters() {
        this.circleR = this.rect.width * ChoiceProps.circleR;

        const triangleSide = this.rect.width * ChoiceProps.triangleSide;
        const triangleHeight = triangleSide * Math.sqrt(3) / 2;

        this.redCenterX = this.rect.width / 2;
        this.redCenterY = (this.rect.height - triangleHeight) / 2;
        this.redCirclePath = new Path2D;
        this.redCirclePath.arc(this.redCenterX, this.redCenterY, this.circleR, 0, 2 * Math.PI)

        this.greenCenterX = this.redCenterX - triangleSide / 2;
        this.greenCenterY = this.redCenterY + triangleHeight;
        this.greenCirclePath = new Path2D;
        this.greenCirclePath.arc(this.greenCenterX, this.greenCenterY, this.circleR, 0, 2 * Math.PI)

        this.blueCenterX = this.greenCenterX + triangleSide;
        this.blueCenterY = this.greenCenterY;
        this.blueCirclePath = new Path2D;
        this.blueCirclePath.arc(this.blueCenterX, this.blueCenterY, this.circleR, 0, 2 * Math.PI);

        this.triangleCenterX = this.redCenterX;
        this.triangleCenterY = this.redCenterY + triangleHeight * 2 / 3;
    },

    onScroll() {
        this.setupViewPort();
        this.draw();
    },

    onResize() {
        this.setupViewPort();
        this.draw();
    },

    draw() {
        this.context2d.clearRect(0, 0, this.rect.width, this.rect.height);
        // this.drawRectBackground();
         this.drawRoundBackground();
        // this.drawChoice();
        this.drawCircles();
        this.drawColorTitles();
    },

    drawChoice() {
        const hsla = this._color.hsla.toString();
        const width = this.rect.width;
        const side = width * ChoiceProps.squareSide;
        const ident = width * ChoiceProps.squareIdent;
        const cornerR = width * ChoiceProps.cornerR; 

        this.drawRoundedSquare(side, ident, ident, cornerR, hsla, ChoiceProps.borderStyle, 
                                ChoiceProps.borderWidth, ChoiceProps.borderDash);
    },

    drawClippedZone(clipTag,    // 1 - clip red circle
                                // 2 - clip green circle    
                                // 4 - clip blue circle    
                    fillColor, strokeColor) {
        const ctx = this.context2d;

        ctx.save();

        if (clipTag & 1) {
            ctx.clip(this.redCirclePath);
        }

        if (clipTag & 2) {
            ctx.clip(this.greenCirclePath);
        }

        if (clipTag & 4) {
            ctx.clip(this.blueCirclePath);
        }

        // fill (intersection of) circles

        ctx.fillStyle = fillColor.rgba.toString();
        ctx.fillRect(0, 0, this.rect.width, this.rect.height);

        // draw borders of circles

        ctx.strokeStyle = strokeColor.rgba.toString();
        ctx.lineWidth = ChoiceProps.circleBorder;

        if (clipTag & 1) {
            ctx.stroke(this.redCirclePath);
        }

        if (clipTag & 2) {
            ctx.stroke(this.greenCirclePath);
        }

        if (clipTag & 4) {
            ctx.stroke(this.blueCirclePath);
        }

        ctx.restore();
    },

    drawCircles() {
        const {r, g, b, a} = this.color.rgba;

        // draw red circle
        const rcolor = ColorObj.createRGBA(r, 0, 0, a);
        this.drawClippedZone(1, rcolor, rcolor.mostContrast());

        // draw green circle
        const gcolor = ColorObj.createRGBA(0, g, 0, a);
        this.drawClippedZone(2, gcolor, gcolor.mostContrast());

        // draw blue circle
        const bcolor = ColorObj.createRGBA(0, 0, b, a);
        this.drawClippedZone(4, bcolor, bcolor.mostContrast());

        // intesection between red and green circles
        const rgcolor = ColorObj.createRGBA(r, g, 0, a);
        this.drawClippedZone(1 + 2, rgcolor, rgcolor.mostContrast());

        // intesection between red and blue circles
        const rbcolor = ColorObj.createRGBA(r, 0, b, a);
        this.drawClippedZone(1 + 4, rbcolor, rbcolor.mostContrast());

        // intesection between green and blue circles
        const gbcolor = ColorObj.createRGBA(0, g, b, a);
        this.drawClippedZone(2 + 4, gbcolor, gbcolor.mostContrast());

        // intesection between red, green and blue circles
        this.drawClippedZone(1 + 2 + 4, this.color, this.color.mostContrast());

        
    },

    drawColorTitles() {
        const ctx = this.context2d;
        const minFontSize = this.rect.height * ChoiceProps.colorMinFontSize;
        const diffFontSize = this.rect.height * ChoiceProps.colorMaxFontSize 
                                                            - minFontSize;
        const {r, g, b} = this.color.rgba;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = this.color.mostContrast().resetRGBA({a: 1}).rgba.toString();
        ctx.font = ChoiceProps.colorFont.replace("{font-size}", 
                        minFontSize + diffFontSize * (r + g + b) / (255 * 3));
        ctx.fillText("R G B", // ChoiceProps.colorTitle, 
                        this.rect.width / 2, this.rect.height * 0.55);

        const [centerX, centerY] = [this.triangleCenterX, this.triangleCenterY];
        const rbgShift = ChoiceProps.rbgTitleShift;

        ctx.fillStyle = this.color.resetRGBA({g: 0, b:0, a: 1}).mostContrast().rgba.toString();
        ctx.font = ChoiceProps.colorFont.replace("{font-size}", 
                        minFontSize + diffFontSize * r / 255);
        ctx.fillText("R", 
            centerX + (this.redCenterX - centerX) * rbgShift,
            centerY + (this.redCenterY - centerY) * rbgShift);   

        ctx.fillStyle = this.color.resetRGBA({r: 0, b:0, a: 1}).mostContrast().rgba.toString();
        ctx.font = ChoiceProps.colorFont.replace("{font-size}", 
                        minFontSize + diffFontSize * g / 255);
        ctx.fillText("G", 
                centerX + (this.greenCenterX - centerX) * rbgShift,
                centerY + (this.greenCenterY - centerY) * rbgShift);   

        ctx.fillStyle = this.color.resetRGBA({r: 0, g:0, a: 1}).mostContrast().rgba.toString();
        ctx.font = ChoiceProps.colorFont.replace("{font-size}", 
                        minFontSize + diffFontSize * b / 255);
        ctx.fillText("B", 
                centerX + (this.blueCenterX - centerX) * rbgShift,
                centerY + (this.blueCenterY - centerY) * rbgShift);   
                },

    drawRectBackground() {
        const width = this.rect.width;
        const side = width * ChoiceProps.squareSide;
        const ident = 2 * width * ChoiceProps.squareIdent;
        const cornerR = width * ChoiceProps.cornerR; 

        this.drawRoundedSquare(side, ident, ident, cornerR, 
                ChoiceProps.bacgroundColor, ChoiceProps.bacgroundBorderStyle, 
                ChoiceProps.borderWidth,
                ChoiceProps.borderDash);

        // pave the background with colored tails

        const tailMargin = side * ChoiceProps.tailMargin;
        const tailSideMargin = (side - tailMargin) / ChoiceProps.tailRowSize;
        const tailSide = tailSideMargin - tailMargin;
        const tailCornerR = side * ChoiceProps.tailCornerR;

        for (let row = 0; row < ChoiceProps.tailRowSize; ++row) {
            const tailIdentY = ident + tailMargin + row * tailSideMargin;
            for (let col = 0; col < ChoiceProps.tailRowSize; ++col) {
                const tailIdentX = ident + tailMargin + col * tailSideMargin;
   
                this.drawRoundedSquare(tailSide, tailIdentX, tailIdentY, tailCornerR, 
                    // RandomColor.getColor().hsla.toString());    
                    PredictableColor.getColor().hsla.toString());    
            }
        }      
    },

    overlapCircle(tailX, tailY, circleSideR2, centerX, centerY) {
        return MyMath.square(tailX - centerX) + MyMath.square(tailY - centerY) < circleSideR2;

    },

    overlapCircles(tailX, tailY, circleSideR2) {
        return this.overlapCircle(tailX, tailY, circleSideR2,
                                  this.redCenterX, this.redCenterY)
                || this.overlapCircle(tailX, tailY, circleSideR2,
                                    this.greenCenterX, this.greenCenterY)
                || this.overlapCircle(tailX, tailY, circleSideR2,
                                        this.blueCenterX, this.blueCenterY);
        },

    drawRoundBackground() {
        const circleR = this.circleR

        // pavement zone
        const paveTop    = this.redCenterY - circleR;
        const paveLeft   = this.greenCenterX - circleR;
        const paveRight  = this.blueCenterX + circleR;
        const paveBottom = this.blueCenterY + circleR;

        const tailMargin = this.rect.width * ChoiceProps.tailMargin;
        const paveSide = paveRight - paveLeft + 2 * tailMargin;
        const tailSideMargin = (paveSide + tailMargin) / ChoiceProps.tailRowSize;
        const tailSide = tailSideMargin - tailMargin;
        const tailCornerR = paveSide * ChoiceProps.tailCornerR;

        const tailSide_2 = tailSide / 2;
        const tailSideR = tailSide * Math.SQRT1_2;
        const circleSideR = this.circleR + tailSideR;
        const circleSideR2 = MyMath.square(circleSideR);

        PredictableColor.clear();

        for (let row = 0; row < ChoiceProps.tailRowSize; ++row) {
            const tailIdentY = paveTop - tailMargin + row * tailSideMargin;
            for (let col = 0; col < ChoiceProps.tailRowSize; ++col) {
                const tailIdentX = paveLeft -tailMargin + col * tailSideMargin;
   
                if( this.overlapCircles(tailIdentX + tailSide_2, 
                                        tailIdentY + tailSide_2, circleSideR2) ) {
                    this.drawRoundedSquare(tailSide, tailIdentX, tailIdentY, tailCornerR, 
                                        //RandomColor.getColor().hsla.toString());
                                        PredictableColor.getColor().rgba.toString());
                }
            }
        }      


    },

    drawRoundedSquare(side, identX, identY, cornerR, color, borderColor, borderWidth, borderDash) {
        const ctx = this.context2d;

        const x0 = side / 2 + identX;
        const y0 = identY;

        const x1 = side + identX;
        const y1 = y0;

        const x2 = x1;
        const y2 = side + identY;

        const x3 = identX;
        const y3 = y2;

        const x4 = x3;
        const y4 = y0;

        ctx.save();
        ctx.beginPath();
        if (borderColor !== undefined) {
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = borderWidth;
            ctx.setLineDash(borderDash);
        }
        ctx.fillStyle = color;
        ctx.moveTo(x0, y0);
        ctx.arcTo(x1, y1, x2, y2, cornerR);
        ctx.arcTo(x2, y2, x3, y3, cornerR);
        ctx.arcTo(x3, y3, x4, y4, cornerR);
        ctx.arcTo(x4, y4, x1, y1, cornerR);
        ctx.lineTo(x0, y0);
        if (borderColor !== undefined) {
            ctx.stroke();
        }
        ctx.fill();
        ctx.restore();
    }
}  // end of Choice

const PredefColorsProps = {
    blurColorName:  '0px 0px 2px',
    blurColor: 0.8,
    selectedColorBorder: '3px solid',
    focusedBorder: '2px solid black',
    unfocusedBorder: '1px solid gray'
}

const PredefinedColors = {
    started: false,
    element: null,
    elementFilter: null,
    elementStatus: null,
    colorFullList: [],
    selectedItem: null,
    _color: null,
    pageSize: 8,


    start() {
        if (!this.started) {
            this.element = document.getElementById('PredefColList');
            this.element.setAttribute('tabindex', '0'); // make the list focusable
            this.element.style.border = PredefColorsProps.unfocusedBorder;

            this.elementFilter = document.getElementById('ColorFilterText');
            this.elementStatus = document.getElementById('ColorFilterStatus');


            for (const name in CSSColors) {
                const color = ColorObj.createHEXA(CSSColors[name]);
                const contrast = color.mostContrast();
                this.colorFullList.push({
                    name : name,
                    color: color,
                    contrast: contrast
                });
            }
            this.fillList(this.colorFullList);    
            
            this.pageSize = Math.floor(this.element.clientHeight / this.element.firstElementChild.clientHeight);

            this.element.addEventListener('focus', () => this.onFocus());            
            this.element.addEventListener('blur',  () => this.onBlur());            
            this.element.addEventListener('keydown', (event) => this.onKeydown(event));

            this.elementFilter.addEventListener('input', (event) => this.onChangeFilter());

        }

        this.started = true;
    },

    fillList(colorList) {
        this.unselectItem();
        this.clearList();

        const IdMaker = {
            idSet: new Set(),
            getUniqId(hexa) {
                if (!this.checkAndAdd(hexa)) {
                    return hexa;
                }
                for (suffix = 1; true; ++ suffix) {
                    const probe = hexa + '_' + suffix;
                    if (!this.checkAndAdd(probe)) {
                        return probe;
                    }
                }
                console.assert(false); // never executed

            },

            checkAndAdd(probe) {
                const res = this.idSet.has(probe);
                this.idSet.add(probe);
                return res;
            }
        }

        colorList.forEach(
            listItem => {
                const {color, contrast} = listItem;
                const colItem = document.createElement('p');
                colItem.innerHTML = listItem.name;
                colItem.setAttribute('class', 'color-item');
                colItem.setAttribute('id', IdMaker.getUniqId(color.hexa.toString()));
                colItem.setAttribute('name', listItem.name);
                colItem.style.color = '#00000000'; // transparent;

                // blur the color name
                colItem.style.textShadow = PredefColorsProps.blurColorName + ' ' + contrast.hexa.toString();

                // blur the color
                colItem.style.backgroundColor = color.resetRGBA({a: PredefColorsProps.blurColor}).hexa.toString();

                colItem.addEventListener('click', event => this.onClickItem(event));

                this.element.appendChild(colItem);
            }        
        );
        const listLength = colorList.length;
        this.elementStatus.innerHTML = listLength + ' colors filtered:';
        this.elementStatus.style.color = listLength === 0 ? 'red' : 'black';
    },

    clearList() {
        // Clear existing list
        while (this.element.firstElementChild) {
            this.element.removeChild(this.element.lastElementChild);
        }
    },

    onClickItem(event) {
        const itemElem = event.target;
        const color = this.getColor(itemElem);
        this.selectItem(itemElem, color);
        this.yieldColor(color);
    },

    onFocus() {
        this.element.style.border = PredefColorsProps.focusedBorder;
        if (this.selectedItem) {
            this.scrollToSelected();
        } 
        else {
            // select the first color if any
            const firstItem = this.element.firstElementChild
            if (firstItem) {
                const color =  this.getColor(firstItem);
                this.selectItem(firstItem, color);
                this.yieldColor(color);
            }
        }
    },

    onBlur() {
        this.element.style.border = PredefColorsProps.unfocusedBorder;
    },
    
    onKeydown(event) {
        if (!this.selectedItem) {
            // do nothing
            return;
        }

        let newItem = null;
        switch (event.key) {
            case 'ArrowUp':
            case 'ArrowLeft': {
                newItem = this.goPrev(1);
                break;
            }
            case 'PageUp': {
                newItem = this.goPrev(this.pageSize);
                break;
            }
            case 'ArrowDown':
            case 'ArrowRight': {
                newItem = this.goNext(1);
                break;
            }
            case 'PageDown': {
                newItem = this.goNext(this.pageSize);
                break;
            }
        }

        if (newItem && newItem != this.selectedItem) {
            const newColor = this.getColor(newItem);
            this.selectItem(newItem, newColor);
            this.yieldColor(newColor);
            event.preventDefault();
        }
    },
    
    onChangeFilter() {
        const filterText = this.elementFilter.value;
        const re = new RegExp(filterText);
        const filteredList = this.filterList(re);
        this.fillList(filteredList);
        this.onChangeColor();
    },

    filterList(regExp) {
        let filteredList = [];

        this.colorFullList.forEach (
            item => {
                if (regExp.test(item.name)) {
                    filteredList.push(item);
                }
            }
        );

        return filteredList;
    },

    goNext(itemNum) {
        let item = this.selectedItem;
        let lastNonNull = item;
        while (item && itemNum--) {
          lastNonNull = item;  
          item = item.nextElementSibling          
        }
        return item || lastNonNull;
    },

    goPrev(itemNum) {
        let item = this.selectedItem;
        let lastNonNull = item;
        while (item && itemNum--) {
          lastNonNull = item;
          item = item.previousElementSibling;          
        }
        return item || lastNonNull;
    },

    selectItem(itemElem, color) {
        this.unselectItem();
        const contrast = color.mostContrast().hexa.toString();

        // unblur the color
        itemElem.style.backgroundColor = color.hexa.toString();
        itemElem.style.border = PredefColorsProps.selectedColorBorder + ' ' + contrast;

        // unblur the color name
        itemElem.style.color = contrast;
        itemElem.style.textShadow = 'none';

        this.selectedItem = itemElem;
        this.scrollToSelected();
    },

    getColor(itemElem) {
        return ColorObj.createHEXA(itemElem.getAttribute('id'));
    },

    unselectItem() {
        if (this.selectedItem) {
            const color = this.getColor(this.selectedItem);
            
            const shadowColor = color.mostContrast();
            this.selectedItem.style.border = '';
            this.selectedItem.style.color = '#00000000'; // transparent

            // blur the color name
            this.selectedItem.style.textShadow = PredefColorsProps.blurColorName + ' ' + shadowColor.hexa.toString();

            // blur the color
            this.selectedItem.style.backgroundColor = color.resetRGBA({a: PredefColorsProps.blurColor}).hexa.toString();

            this.selectedItem = null;
        }
    },

    scrollToSelected() {
        if (this.selectedItem) {
            this.selectedItem.scrollIntoView({block: "nearest"});
        }
    },

    yieldColor(color) {
        this._color = color;
        Master.onChangePredefs();
    },

    onChangeColor() {
        const itemElem = document.getElementById(this._color.hexa.toString());
        if( itemElem ) {
            // predefined color is found
            this.selectItem(itemElem, this.getColor(itemElem));
        } else {
            // predefined color is not found
            this.unselectItem();
        }
    },

    get color() {
        return this._color;
    },

    set color (val) {
        this._color = val.resetRGBA({a: 1}); // opaque color
        this.onChangeColor();
    }
} // end of PredefinedColors

const RandomColor = {
    getColor () {
        return ColorObj.createHSLA (
                    Math.random() * 360,        // Random hue: 0-360
                    50 + Math.random() * 50,    // Random saturation: 50-100%
                    30 + Math.random() * 20,    // Random Lightness: 30-50%
                    1                           // alpha = 1
                );
    }
} // end of RandomColor

const PredictableColor = { // generates 25 regular colors
    rIndex: 0,
    gIndex: 0,
    bIndex: 0,

    clear() {
        this.rIndex = 0;
        this.gIndex = 0;
        this.bIndex = 0;
    },

    getColor() {
        const incMod3 = (x) => (x + 1) % 3;
        const vals = [0, 127, 255]
        this.bIndex = incMod3(this.bIndex);
        if (this.bIndex == 0) {
            this.gIndex = incMod3(this.gIndex);
            if (this.gIndex == 0) {
                this.rIndex = incMod3(this.rIndex)
            }
        }
        return ColorObj.createRGBA (
            vals[this.rIndex], vals[this.gIndex], vals[this.bIndex], 1);
    }

}  // end of PredictableColor


const MasterProps = {
    initColor: ColorObj.createRGBA(127, 255, 212, 0.5) // aquamarine
}

const Master = {
    started: false,
    curColor: null,
    start() {
        if (!this.started) {
            ColorWheel.start();
            Hue.start();
            Saturation.start();
            Lightness.start();
            Alpha.start();
            Red.start();
            Green.start();
            Blue.start();
            HSLAText.start();
            RGBAText.start();
            PredefinedColors.start();
            Choice.start();

            this.curColor = MasterProps.initColor;
            this.updateControls(null);
            
            this.started = true;
        }
    },

    onChangeColorWheel () {
        this.curColor = this.curColor.resetHSLA({h: ColorWheel.hue, s: ColorWheel.saturation});
        this.updateControls(ColorWheel);
    },

    onChangeHue () {
        this.curColor = this.curColor.resetHSLA({h: Hue.value});
        this.updateControls(Hue);
    },

    onChangeSaturation () {
        this.curColor = this.curColor.resetHSLA({s: Saturation.value});
        this.updateControls(Saturation);
    },

    onChangeLightness () {
        this.curColor = this.curColor.resetHSLA({l: Lightness.value});
        this.updateControls(Lightness);
    },

    onChangeAlpha () {
        this.curColor = this.curColor.resetHSLA({a: Alpha.value});
        this.updateControls(Alpha);
    },

    onChangeRed () {
        this.curColor = this.curColor.resetRGBA({r: Red.value});
        this.updateControls(Red);
    },

    onChangeGreen () {
        this.curColor = this.curColor.resetRGBA({g: Green.value});
        this.updateControls(Green);
    },

    onChangeBlue () {
        this.curColor = this.curColor.resetRGBA({b: Blue.value});
        this.updateControls(Blue);
    },

    onChangeHSLAText () {
        this.curColor = HSLAText.color;
        this.updateControls(HSLAText);
    },

    onChangeRGBAText () {
        this.curColor = RGBAText.color;
        this.updateControls(RGBAText);
    },

    onChangePredefs() {
        this.curColor = PredefinedColors.color.resetRGBA({a: this.curColor.rgba.a});
        this.updateControls(PredefinedColors);
    },

    updateControls(gameChanger) {
        const hsla = this.curColor.hsla;
        const rgba = this.curColor.rgba;

        Choice.color = this.curColor;

        if (gameChanger !== ColorWheel) {
            ColorWheel.hue = hsla.h;
            ColorWheel.saturation = hsla.s;
            ColorWheel.lightness = hsla.l;
        }

        if (gameChanger !== Hue) {
            Hue.value = hsla.h;
        }

        if (gameChanger !== Saturation) {
            Saturation.value = hsla.s;
        }

        if (gameChanger !== Lightness) {
            Lightness.value = hsla.l;
        }

        if (gameChanger !== Alpha) {
            Alpha.value = hsla.a;
        }

        if (gameChanger !== Red) {
            Red.value = rgba.r;
        }

        if (gameChanger !== Green) {
            Green.value = rgba.g;
        }

        if (gameChanger !== Blue) {
            Blue.value = rgba.b;
        }

        if (gameChanger !== HSLAText) {
            HSLAText.color = this.curColor;           
        }

        if (gameChanger !== RGBAText) {
            RGBAText.color = this.curColor;         
        }

        if (gameChanger !== PredefinedColors) {
            PredefinedColors.color = this.curColor;
        }
    }
} // end of Master

const simpleDecInt = /^\s*[\+\-]?\d*\s*$/;
const simpleFloat  = /^\s*[+-]?(\d*.)?\d+\s*$/;
const simpleHSLA   = /^\s*hsla\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%(\s*,\s*(\d*.)?\d+)?\s*\)\s*$/;
const simpleRGBA   = /^\s*rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+(\s*,\s*(\d*.)?\d+)?\s*\)\s*$/;

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

function parseDecFloat(text, min, max) {
    if (!simpleFloat.test(text)) {
        return NaN;
    }

    const val = parseFloat(text);
    if (isNaN(val) || val < min || val > max) {
        return NaN;
    } else {
        return val;
    }
}

function parseHSLA(text) {
    if (!simpleHSLA.test(text)) {
        return null;
    }

    const hueStr = text.substring(text.indexOf('(') + 1);
    const hue = parseInt(hueStr, 10);

    const satStr = hueStr.substring(hueStr.indexOf(',') + 1);
    const sat = parseInt(satStr, 10);

    const lightStr = satStr.substring(satStr.indexOf(',') + 1);
    const light = parseInt(lightStr, 10);

    let alpha = 1;
    const alphaIndex = lightStr.indexOf(',');
    if (alphaIndex != -1) {
        const alphaStr = lightStr.substring(alphaIndex + 1);
        alpha = parseFloat(alphaStr);
    }

    if (hue < 0 || hue > 360 || sat < 0 || sat > 100 
        || light < 0 || light > 100 || alpha < 0 || alpha > 1) {
        return null;
    } else {
        return ColorObj.createHSLA(hue, sat, light, alpha);
    }
}

function parseRGBA(text) {
    if (!simpleRGBA.test(text)) {
        return null;
    }

    const redStr = text.substring(text.indexOf('(') + 1);
    const red = parseInt(redStr, 10);

    const greenStr = redStr.substring(redStr.indexOf(',') + 1);
    const green = parseInt(greenStr, 10);

    const blueStr = greenStr.substring(greenStr.indexOf(',') + 1);
    const blue = parseInt(blueStr, 10);

    let alpha = 1;
    const alphaIndex = blueStr.indexOf(',');
    if (alphaIndex != -1) {
        const alphaStr = blueStr.substring(alphaIndex + 1);
        alpha = parseFloat(alphaStr);
    }

    if (red < 0 || red > 255 || green < 0 || green > 255 
        || blue < 0 || blue > 255 || alpha < 0 || alpha > 1) {
        return null;
    } else {
        return ColorObj.createRGBA(red, green, blue, alpha);
    }
}

function markInvalidText(element) {
    element.style.textDecorationLine = 'line-through';
    element.style.textDecorationColor = 'red';
}

function unmarkInvalidText(element) {
    element.style.textDecorationLine = 'none';
}

class RangeControl {
    #started = false;
    #min;
    #step;
    #max;
    #size;
    #onChange;
    #id;
    #idSlider;
    #idCenter;
    #rounder;
    #value;
    #element       = null;
    #elementSlider = null;
    #elementCenter = null;
    #rect          = null;
    #rectSlider    = null;
    #mouseActive   = false;
    #kboardActive  = false;

    constructor(min, step, max, id, idSlider, idCenter, onChange, rounder) {
        this.#min      = min;
        this.#step     = step;
        this.#max      = max;
        this.#size     = (max - min) / step; // should be integer
        this.#onChange = onChange;
        this.#id       = id;
        this.#idSlider = idSlider;
        this.#idCenter = idCenter;
        this.#rounder  = rounder;
        this.#value    = min;
    }

    start() {
        if( !this.#started ) {
            this.#element = document.getElementById(this.#id);
            this.#element.setAttribute('tabindex', '0'); // make the ranger focusable

            this.#elementSlider = document.getElementById(this.#idSlider);
            this.#elementCenter = document.getElementById(this.#idCenter);
            this.#getViewPort();
            this.#element.addEventListener('mousedown',
               (event)=> {
                  this.#mouseActive = true;
                  this.#sliderToggle();
                  this.#sliderMove(event.clientX);
                  this.#getValue(event.clientX);
                  this.#onChange();
               });

               this.#element.addEventListener('mousemove', 
               (event)=> {
                  if (this.#mouseActive) {
                    this.#sliderMove(event.clientX);
                    this.#getValue(event.clientX);
                    this.#onChange();
                }
               });

            // keyboard events
            this.#element.addEventListener('focus',   () => this.#onFocus());            
            this.#element.addEventListener('blur',    () => this.#onBlur());
            this.#element.addEventListener('keydown', (event) => this.#onKeydown(event));

            document.addEventListener('scroll', () => this.#onScroll());
            window.addEventListener('resize', () => this.#onResize());

            ['mouseup', 'mouseleave'].forEach(
                // the same handler for the a few events
                eventName => {            
                    this.#element.addEventListener(eventName, 
                    () => { 
                        this.#mouseActive = false;
                        this.#sliderToggle();
                    }

            )});

            this.#started = true;
        }
    }

    #onFocus() {
        this.#kboardActive = true;
        this.#sliderToggle();

        // get focus
        this.#element.style.borderColor = 'black';
       this.#element.style.borderWidth = '2px';
    }

    #onBlur() {
        this.#kboardActive = false;
        this.#sliderToggle();

        // loose focus
        this.#element.style.borderColor = 'gray';
        this.#element.style.borderWidth = '1px';
    }

    #onKeydown(event) {
        let newValue = this.#value;

        switch (event.key) {
            case 'ArrowUp':
            case 'ArrowRight':
                if (this.#value >= this.#max) {
                    // cyclic movement
                    newValue = this.#min;
                } else {
                    newValue = Math.min(this.#value + this.#step, this.#max);
                }
                break;

            case 'ArrowDown':
            case 'ArrowLeft':
                if (this.#value <= this.#min) {
                    // cyclic movement
                    newValue = this.#max;
                } else {
                    newValue = Math.max(this.#value - this.#step, this.#min);
                }
                break;
        }

        if (newValue !== this.#value) {
            this.#value = newValue;
            this.#sliderReset();
            this.#onChange();
        }
    }

    #onScroll() {
        this.#getViewPort();
    }

    #onResize() {
        this.#getViewPort();
    }

    #getViewPort() {
        this.#rect = this.#element.getBoundingClientRect();
        this.#rectSlider = this.#elementSlider.getBoundingClientRect();
    }

    #sliderMove(x) {
        let left = x - this.#rect.left - this.#rectSlider.width / 2;
        left = Math.max(left, 0);
        left = Math.min(left, this.#rect.width - this.#rectSlider.width);

        this.#elementSlider.style.left = left;
    }

    #sliderToggle() {
        if (this.#mouseActive || this.#kboardActive) {
            // activate the slider
            this.#elementCenter.setAttribute('stroke', '#FFF');
        } else {
            // deactivate the slider
            this.#elementCenter.setAttribute('stroke', '#000');
        }
    }

    #getValue(x) {
        const workLength = this.#rect.width - this.#rectSlider.width;
        const posX = x - this.#rect.left - this.#rectSlider.width / 2;
        let intVal = Math.floor(posX/workLength * this.#size);
        intVal = Math.max(intVal, 0);
        intVal = Math.min(intVal, this.#size);
        this.#value = this.#doRound(this.#min + intVal * this.#step);
    }

    #sliderReset() {
        const workLength = this.#rect.width - this.#rectSlider.width;
        const x = this.#rect.left + this.#rectSlider.width / 2 + (this.#value - this.#min) / (this.#max - this.#min) * workLength;
        this.#sliderMove(x);
    }

    #doRound(val) {
        return this.#rounder === undefined ? val : this.#rounder(val);
    }
    get value() {
        return this.#value;
    }

    set value(val) {
        this.#value = val;
        this.#sliderReset();
    }
} // end of RangeControl

Master.start();

 /// alert('script finish');
