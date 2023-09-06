
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
    hueFont:        'bold 14px Arial sans-serif',
    saturationFont: 'bold 14px Arial sans-serif',
    saturationTextMargin: 0.3
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
        this.getViewPort();
    },

    getViewPort() {
        this.rect = this.element.getBoundingClientRect();

        this.centerX = (this.rect.left + this.rect.right) / 2;
        this.centerY = (this.rect.top + this.rect.bottom) / 2;

        this.wheelR = this.rect.height * 0.41;
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
        ctx.font = ColorWheelProps.hueFont;
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
        ctx.font = ColorWheelProps.saturationFont;
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
                        ? centerX + this.sliderR - SliderProps.radius1 - margin - width/2
                        // text is right from the slider
                        : centerX + this.sliderR + SliderProps.radius1 + margin + width/2;
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
    tailMargin: 0.005,
    tailRowSize: 3,
    tailCornerR: 0.08,

    triangleSide: 0.2,
    circleR: 0.3
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

            // Fix size of the canvas
            this.element.width = this.element.clientWidth;
            this.element.height = this.element.clientHeight;

            this.context2d = this.element.getContext("2d");
            this.getViewPort();
            this.getCenters();

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

    getViewPort() {
        this.rect = this.element.getBoundingClientRect();
    },

    getCenters() {
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
        this.blueCirclePath.arc(this.blueCenterX, this.blueCenterY, this.circleR, 0, 2 * Math.PI)
    },

    draw() {
        this.context2d.clearRect(0, 0, this.rect.width, this.rect.height);
        // this.drawRectBackground();
         this.drawRoundBackground();
        // this.drawChoice();
        this.drawCircles();
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

    clipCircle(centerX, centerY) {
        const ctx = this.context2d;
        const path = new Path2D();
        path.arc(centerX, centerY, this.circleR, 0, 2 * Math.PI);
        ctx.clip(path);
    },

    drawClippedZone(clipTag,    // 1 - clip red circle
                                // 2 - clip green circle    
                                // 4 - clip blue circle    
                    color) {
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

        ctx.fillStyle = color;
        ctx.fillRect(0, 0, this.rect.width, this.rect.height);

        ctx.restore();
    },

    drawCircles() {
        const {r, g, b, a} = this.color.rgba;

        // draw red circle
        this.drawClippedZone(1, ColorObj.createRGBA(r, 0, 0, a).rgba.toString());

        // draw green circle
        this.drawClippedZone(2, ColorObj.createRGBA(0, g, 0, a).rgba.toString());

        // draw blue circle
        this.drawClippedZone(4, ColorObj.createRGBA(0, 0, b, a).rgba.toString());

        // intesection between red and green circles
        this.drawClippedZone(1 + 2, ColorObj.createRGBA(r, g, 0, a).rgba.toString());

        // intesection between red and blue circles
        this.drawClippedZone(1 + 4, ColorObj.createRGBA(r, 0, b, a).rgba.toString());

        // intesection between green and blue circles
        this.drawClippedZone(2 + 4, ColorObj.createRGBA(0, g, b, a).rgba.toString());

        // intesection between red, green and blue circles
        this.drawClippedZone(1 + 2 + 4, this.color.rgba.toString());

        
    },

    drawRectBackground() {
        const width = this.rect.width;
        const side = width * ChoiceProps.squareSide;
        const ident = 2 * width * ChoiceProps.squareIdent;
        const cornerR = width * ChoiceProps.cornerR; 

        this.drawRoundedSquare(side, ident, ident, cornerR, 
                ChoiceProps.bacgroundColor, ChoiceProps.bacgroundBorderStyle, ChoiceProps.borderWidth,
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
                                        RandomColor.getColor().hsla.toString());    
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

        for (let row = 0; row < ChoiceProps.tailRowSize; ++row) {
            const tailIdentY = paveTop - tailMargin + row * tailSideMargin;
            for (let col = 0; col < ChoiceProps.tailRowSize; ++col) {
                const tailIdentX = paveLeft -tailMargin + col * tailSideMargin;
   
                if( this.overlapCircles(tailIdentX + tailSide_2, 
                                        tailIdentY + tailSide_2, circleSideR2) ) {
                    this.drawRoundedSquare(tailSide, tailIdentX, tailIdentY, tailCornerR, 
                                        RandomColor.getColor().hsla.toString());
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
        ctx.arcTo(x4, y4, x0, y0, cornerR);
        ctx.lineTo(x0, y0);
        if (borderColor !== undefined) {
            ctx.stroke();
        }
        ctx.fill();
        ctx.restore();
    }
}  // end of Choice

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


const MasterProps = {
    initColor: ColorObj.createHSLA(45, 50, 50, 0.5)
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
            Choice.start();

            this.curColor = MasterProps.initColor;
            this.updateControls(null);
            this.started = true;
        }
    },

    onChangeColorWheel () {
        const {l, a} = this.curColor.hsla;
        this.curColor = ColorObj.createHSLA(ColorWheel.hue, ColorWheel.saturation, l, a);
        this.updateControls(ColorWheel);
    },

    onChangeHue () {
        const {s, l, a} = this.curColor.hsla;
        this.curColor = ColorObj.createHSLA(Hue.value, s, l, a);
        this.updateControls(Hue);
    },

    onChangeSaturation () {
        const {h, l, a} = this.curColor.hsla;
        this.curColor = ColorObj.createHSLA(h, Saturation.value, l, a);
        this.updateControls(Saturation);
    },

    onChangeLightness () {
        const {h, s, a} = this.curColor.hsla;
        this.curColor = ColorObj.createHSLA(h, s, Lightness.value, a);
        this.updateControls(Lightness);
    },

    onChangeAlpha () {
        const {h, s, l} = this.curColor.hsla;
        this.curColor = ColorObj.createHSLA(h, s, l, Alpha.value);
        this.updateControls(Alpha);
    },

    onChangeRed () {
        const {g, b, a} = this.curColor.rgba;
        this.curColor = ColorObj.createRGBA(Red.value, g, b, a);
        this.updateControls(Red);
    },

    onChangeGreen () {
        const {r, b, a} = this.curColor.rgba;
        this.curColor = ColorObj.createRGBA(r, Green.value, b, a);
        this.updateControls(Green);
    },

    onChangeBlue () {
        const {r, g, a} = this.curColor.rgba;
        this.curColor = ColorObj.createRGBA(r, g, Blue.value, a);
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

    const hueStr = text.substr(text.indexOf('(') + 1);
    const hue = parseInt(hueStr, 10);

    const satStr = hueStr.substr(hueStr.indexOf(',') + 1);
    const sat = parseInt(satStr, 10);

    const lightStr = satStr.substr(satStr.indexOf(',') + 1);
    const light = parseInt(lightStr, 10);

    let alpha = 1;
    const alphaIndex = lightStr.indexOf(',');
    if (alphaIndex != -1) {
        const alphaStr = lightStr.substr(alphaIndex + 1);
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

    const redStr = text.substr(text.indexOf('(') + 1);
    const red = parseInt(redStr, 10);

    const greenStr = redStr.substr(redStr.indexOf(',') + 1);
    const green = parseInt(greenStr, 10);

    const blueStr = greenStr.substr(greenStr.indexOf(',') + 1);
    const blue = parseInt(blueStr, 10);

    let alpha = 1;
    const alphaIndex = blueStr.indexOf(',');
    if (alphaIndex != -1) {
        const alphaStr = blueStr.substr(alphaIndex + 1);
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
