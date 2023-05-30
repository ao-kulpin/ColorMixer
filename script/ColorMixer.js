// alert('script start');

const ColorWheel = {
    started: false,
    element: null,
    rect: null,
    gradient:{
        started: false,
        element: null,

        start() {
            if (!this.started) {
                this.element = document.getElementById('ConicGradient');
                this.element.addEventListener('mousemove', (event)=>ColorWheel.sliderMove(event));

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
                    this.element.addEventListener('mousedown', (event)=>{ColorWheel.sliderDown();});
                    this.element.addEventListener('mouseup', (event)=>{ColorWheel.sliderUp();});
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
            document.addEventListener('scroll', ()=>ColorWheel.onScroll());
            this.slider.start();
            this.gradient.start();
            this.started = true;
        }
    },

    sliderDown() {
        this.slider.active = true;
        this.slider.center.element.setAttribute('stroke', '#000');
    },

    sliderUp() {
        this.slider.active = false;
        this.slider.center.element.setAttribute('stroke', '#FFF');
    },
    sliderMove(event) {

        if (this.slider.active) {
            this.slider.element.style.left = event.clientX - this.rect.left - this.slider.rect.width / 2;
            this.slider.element.style.top = event.clientY - this.rect.top - this.slider.rect.height / 2;
        }
    },
    onScroll() {
        ColorWheel.rect = ColorWheel.element.getBoundingClientRect();
    }
};

ColorWheel.start();

// alert('script finish');
