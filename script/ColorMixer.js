alert('script start');

const ColorWheel = {
    started: false,
    element: null,
    rect: null,
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
                    this.element.addEventListener('mousedown', (event)=>{ ColorWheel.centerDown(); })
                    this.element.addEventListener('mouseup', (event)=>{ ColorWheel.centerUp(); })
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
            this.element = document.getElementById('ColorWheel');
            this.rect = this.element.getBoundingClientRect();
            this.slider.start();
            this.started = true;
        }
    },

    centerDown() {
        this.slider.active = true;
        this.slider.center.element.setAttribute('stroke', '#000');
    },

    centerUp() {
        this.slider.active = false;
        this.slider.center.element.setAttribute('stroke', '#FFF');
    }
};

ColorWheel.start();

alert('script finish');
