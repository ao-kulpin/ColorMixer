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
                    // his.element.addEventListener('mousedown', (event)=>{ColorWheel.sliderActivate();});
                    //this.element.addEventListener('mouseup', (event)=>{ColorWheel.sliderDeactivate();});
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
    }
};

ColorWheel.start();

// alert('script finish');
