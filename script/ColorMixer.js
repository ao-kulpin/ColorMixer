// alert('script start');

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
            this.getViewPoint();
            document.addEventListener('scroll', ()=>ColorWheel.onScroll());
            this.started = true;
        }
    },

    sliderActivate() {
        this.slider.active = true;
        this.slider.center.element.setAttribute('stroke', '#000');
    },

    sliderDeactivate() {
        this.slider.active = false;
        this.slider.center.element.setAttribute('stroke', '#FFF');
    },
    sliderMove(x, y) {
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
        this.getViewPoint();
    },
    getViewPoint() {
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

        const r = Math.sqrt(distX * distX + distY * distY);

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
    }
}  // end of ColorWheel

const Hue = {
    started: false,
    elementText: null,
    _value: 0,
    start() {
        if (!this.started) {
            this.elementText = document.getElementById('HueText');
            this.elementText.addEventListener('input', (event) => Hue.onChangeText());
            this.started = true;
        }
    },
    get value () {
        return this._value;
    },
    set value (val) {
        this._value = val;
        this.elementText.value = val;
    },
    onChangeText() {
        this._value = this.elementText.value;
        Master.onChangeHue();

    }
}  // end of Hue

const Saturation = {
    started: false,
    elementText: null,
    _value: 100,
    start() {
        if (!this.started) {
            this.elementText = document.getElementById('SaturationText');
            this.elementText.addEventListener('input', (event) => Saturation.onChangeText());
            this.started = true;
        }
    },
    set value (val) {
        this._value = val;
        this.elementText.value = val;
    },
    onChangeText() {

    }


} // end of Saturation

const Master = {
    started: false,
    start() {
        if (!this.started) {
            ColorWheel.start();
            Hue.start();
            Saturation.start();
            this.started = true;
        }
    },

    onChangeColorWheel () {
        Hue.value = ColorWheel.hue;
        Saturation.value = ColorWheel.saturation;
    },

    onChangeHue () {
        ColorWheel.hue = Hue.value;
    }

} // end of Master

Master.start();

// alert('script finish');
