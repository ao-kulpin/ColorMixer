// alert('script start');

const colorWheel = document.getElementById('ColorWheel');
const wheelHandle = document.getElementById('WheelHandle');
const smallCircle = document.getElementById('SmallCircle');
const bigCircle = document.getElementById('BigCircle');
const conicGradient = document.getElementById('ConicGradient');

//conicGradient.onmousemove = gradientMouseMove;
//smallCircle.onmousedown = smallCircleDown;
//smallCircle.onmouseup = smallCircleUp;

const handleRect = wheelHandle.getBoundingClientRect();
let wheelRect = colorWheel.getBoundingClientRect();

let handleACtive = false;
function smallCircleDown(event) {
    console.log('smallCircleDown');
    smallCircle.setAttribute('stroke', '#000');
    handleACtive = true;
}

function smallCircleUp(event) {
    smallCircle.setAttribute('stroke', '#FFF');
    handleACtive = false;
}

function gradientMouseMove(event) {
    if (handleACtive) {
        console.log(`gradientMouseMove ${event.clientX} ${event.clientY}`);
        wheelHandle.style.left = event.clientX - wheelRect.left - handleRect.width / 2;
        wheelHandle.style.top = event.clientY - wheelRect.top - handleRect.height / 2;
    }
}

function docScroll(event) {
    wheelRect = colorWheel.getBoundingClientRect();
}

conicGradient.onmousemove = gradientMouseMove;
document.addEventListener('scroll', docScroll);
smallCircle.onmousedown = smallCircleDown;
smallCircle.onmouseup = smallCircleUp;

// alert('script finish');
