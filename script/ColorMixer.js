// alert('script start');

const ColorWheel = {
    started: false,
    element: null,
    rect: null,
    centerX: 0,
    centerY: 0,
    currentHue: 0,
    currentRadius: 0,
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
                   }
                );
                this.element.addEventListener('mousemove', 
                   (event)=> {
                    ColorWheel.sliderMove(event.clientX, event.clientY);
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
                this.rect = this.element.getBoundingClientRect();
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
            this.rect = this.element.getBoundingClientRect();
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

        if (this.slider.active) {
            this.slider.element.style.left = x - this.rect.left - this.slider.rect.width / 2;
            this.slider.element.style.top = y - this.rect.top - this.slider.rect.height / 2;
        }
    },
    onScroll() {
        ColorWheel.rect = ColorWheel.element.getBoundingClientRect();
    },
    getViewPoint() {
        this.rect = this.element.getBoundingClientRect();
        this.slider.rect = ColorWheel.slider.element.getBoundingClientRect();

        this.centerX = (this.rect.left + this.rect.right) / 2;
        this.centerY = (this.rect.top + this.rect.bottom) / 2;
    },
    calcHue(x, y) {
        if (x === this.centerX && y === this.centerY) {
            // the slider is on the center - calculating is impossible
            return;
        }

        const distX = x - this.centerX;
        const distY = y - this.centerY;

        this.currentRadius = Math.sqrt(distX * distX + distY * distY);

        const sinHue = (y - this.centerY) / this.currentRadius;
        const asinHue = Math.asin(sinHue) * 180 / Math.PI;
        if (asinHue >= 0) {
            if (x >= this.centerX) {
                this.currentHue = asinHue;
            } else {
                this.currentHue = 180 - asinHue;
            }
        } else {
            if (x >= this.centerX) {
                this.currentHue = 360 + asinHue;
            } else {
                this.currentHue = 180 + asinHue;
            }
        }
    }
}  // end of ColorWheel

const Hue = {
    started: false,
    elementText: null,
    start() {
        if (!this.started) {
            this.elementText = document.getElementById('HueText');
            this.elementText.addEventListener('input', (event) => Hue.onChangeText());
            this.started = true;
        }
    },
    onChangeText() {

    }
}  // end of Hue

const Master = {
    started: false,
    start() {
        if (!this.started) {
            ColorWheel.start();
            Hue.start();
            this.started = true;
        }
    }

} // end of Master

Master.start();

// alert('script finish');
