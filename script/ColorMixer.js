/// alert('script start');

const ColorWheel = {
    started: false,
    element: null,
    rect: null,
    centerX: 0,
    centerY: 0,
    _hue: 0,
    _saturation: 100,
    wheelRadius: 10,
    gradient:{
        started: false,
        element: null,

        start() {
            if (!this.started) {
                this.element = document.getElementById('ConicGradient');
                this.element.addEventListener('mousedown', 
                   (event)=> {
                      ColorWheel.sliderActivate();
                      ColorWheel.sliderMove(event.clientX, event.clientY);
                      ColorWheel.getHueAndSaturation(event.clientX, event.clientY);
                      Master.onChangeColorWheel();
                   }
                );
                this.element.addEventListener('mousemove', 
                   (event)=> {
                      if (ColorWheel.slider.active) {
                        ColorWheel.sliderMove(event.clientX, event.clientY);
                        ColorWheel.getHueAndSaturation(event.clientX, event.clientY);
                        Master.onChangeColorWheel();
                      }
                   }
                );
                this.element.addEventListener('mouseup', 
                   (event)=> {
                    ColorWheel.sliderDeactivate();
                   }
                );

                this.started = true;
            }
        }
    },
    slider: {
        started: false,
        element: null,
        rect: null,
        active:false,

        center: {
            started: false,
            element: null,
            start() {
                if (!this.started) {
                    this.element = document.getElementById('WheelSliderCenter');
                    this.started = true;
                }
            }
        
        },

        start() {
            if (!this.started) {
                this.element = document.getElementById('WheelSlider');
                this.center.start();
                this.started = true;
            }
        }
    },
    start() {
        if (!this.started) {
            this.slider.start();
            this.gradient.start();
            this.element = document.getElementById('ColorWheel');
            this.getViewPort();
            document.addEventListener('scroll', ()=>ColorWheel.onScroll());
            this.started = true;
        }
    },

    sliderActivate() {
        this.slider.active = true;
        this.slider.center.element.setAttribute('stroke', '#FFF');
    },

    sliderDeactivate() {
        this.slider.active = false;
        this.slider.center.element.setAttribute('stroke', '#000');
    },
    sliderMove(x, y) {
        const distX = x - this.centerX;
        const distY = y - this.centerY;

        const r = Math.sqrt(distX * distX + distY * distY);

        if (r > this.wheelRadius) {
            // the slider can't go out of th color wheel
            return;
        }

        this.slider.element.style.left = x - this.rect.left - this.slider.rect.width / 2;
        this.slider.element.style.top = y - this.rect.top - this.slider.rect.height / 2;
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
        this.slider.rect = ColorWheel.slider.element.getBoundingClientRect();

        this.centerX = (this.rect.left + this.rect.right) / 2;
        this.centerY = (this.rect.top + this.rect.bottom) / 2;

        this.wheelRadius = this.rect.height / 2;
    },
    getHueAndSaturation(x, y) {
        if (x === this.centerX && y === this.centerY) {
            // the slider is on the center - calculating is impossible
            this._hue = 0;
            this._saturation = 0;
            return;
        }

        const distX = x - this.centerX;
        const distY = y - this.centerY;

        let r = Math.sqrt(distX * distX + distY * distY);

        if (r/this.wheelRadius > 1) {
            // the slider can't go out of th color wheel
            r = this.wheelRadius;
        }

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

        this._hue = Math.floor(newHue);
        this._saturation = Math.min(Math.floor(r * 100 / this.wheelRadius), 100);;
    },

    get hue () {
        return this._hue;
    },

    set hue (val) {
        this._hue = val;
        this.sliderReset();
    },

    get saturation () {
        return this._saturation;
    },

    set saturation (val) {
        this._saturation = val;
        this.sliderReset();
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
            this._value = n;
            Master.onChangeSaturation();
        }
    }
} // end of Saturation

const initHue = 45;
const initSaturation = 50;

const Master = {
    started: false,
    start() {
        if (!this.started) {
            ColorWheel.start();
            Hue.start();
            Saturation.start();

            ColorWheel.hue = initHue;
            ColorWheel.saturation = initSaturation;

            Hue.value = initHue;
            Saturation.value = initSaturation;

            this.started = true;
        }
    },

    onChangeColorWheel () {
        Hue.value = ColorWheel.hue;
        Saturation.value = ColorWheel.saturation;
    },

    onChangeHue () {
        ColorWheel.hue = Hue.value;
    },

    onChangeSaturation () {
        ColorWheel.saturation = Saturation.value;
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
