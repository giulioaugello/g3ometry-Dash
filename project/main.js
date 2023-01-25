import {Engine} from "./engine/engine.js";
import {Inputs} from "./engine/inputs.js";
import {ShadersManager} from "./engine/shadersManager.js";

let params = (new URL(document.location)).searchParams;

document.addEventListener("DOMContentLoaded", () => {
    // let fpsParam = params.get('fps')
    // if (fpsParam) {
    //     fpsDomElement.value = fpsParam
    // }
    soundtrack.loop = true
    let playMusicParam = params.get('playMusic')
    if (playMusicParam === 'true') {
        playMusic.checked = true
    } else if (playMusicParam === 'false') {
        playMusic.checked = false
    }

    let showSkyboxParam = params.get("showSkybox")

    if (showSkyboxParam === 'true') {
        skyboxElement.checked = true
    } else if (showSkyboxParam === 'false') {
        skyboxElement.checked = false
    }
});

let screenSizeMediaQuery = window.matchMedia("(min-width: 320px) and (max-width: 1100px)")
let spanValue = false
let icon = document.getElementById("icon")
showIconSettings(screenSizeMediaQuery, icon)

function showIconSettings(x, icon) {
    if (x.matches) { // If media query matches
        icon.style.display = '';
        displayNoneSettings(true)
    } else {
        icon.style.display = 'none';
    }
}

icon.onclick = function showSettings(){
    if (!spanValue){
        spanValue = true
        icon.textContent = "arrow_circle_up";
        displayNoneSettings(false)
    } else {
        spanValue = false
        icon.textContent = "arrow_circle_down";
        displayNoneSettings(true)
    }
}

function displayNoneSettings(b){
    if (b){
        $('.hideOnMobile').hide()
    } else {
        $('.hideOnMobile').show()
    }
}


// prevent long press on mobile
function absorbEvent_(event) {
    var e = event || window.event;
    e.preventDefault && e.preventDefault();
    e.stopPropagation && e.stopPropagation();
    e.cancelBubble = true;
    e.returnValue = false;
    return false;
}
function preventLongPressMenu(nodes) {
    for(var i=0; i<nodes.length; i++){
        nodes[i].ontouchstart = absorbEvent_;
        nodes[i].ontouchmove = absorbEvent_;
        nodes[i].ontouchend = absorbEvent_;
        nodes[i].ontouchcancel = absorbEvent_;
    }
}
preventLongPressMenu(document.getElementsByTagName('img'));


// Engine
let engine = new Engine("canvas");

// Add gui elements
document.getElementById("gui").append(ShadersManager.generateGuiControls().domElement)

// Soundtrack
const soundtrack = document.getElementById("soundtrack");
soundtrack.src = "sound_effects/soundtrack.mp3";

// Counter
let counter;
// const counterElem = document.querySelector('#counter');
const counterElem = document.getElementById("counter")

// Start Button
const startButton = document.getElementById('startButton');
startButton.addEventListener('click', () => {
    if (startButton.value === "Restart") {
        reload()
    } else {
        disableScroll();
        window.dispatchEvent(new CustomEvent('start'))
    }
});

// Quit Button
const quitButton = document.getElementById('quitButton');
quitButton.addEventListener("click", () => {
    quit()
});

// // FPS
// const fpsDomElement = document.getElementById('fpsID');
// fpsDomElement.addEventListener("change", () => {
//     engine.setFPS(fpsDomElement.value)
// });

// Skybox
const skyboxElement = document.getElementById('showSkybox');
// skyboxElement.addEventListener("change", () => {
//     if (skyboxElement.checked) {
//         $('#fpsDiv').hide();
//     } else {
//         $('#fpsDiv').show();
//     }
// });

// Soundtrack
const playMusic = document.getElementById('playMusic')
playMusic.addEventListener('change', () => {
    if (playMusic.checked) {
        soundtrack.play()
    } else {
        soundtrack.pause()
    }
    playMusic.blur()
});

window.addEventListener('start', async (e) => {
    console.log("start event")

    engine.start(120)

    if (playMusic.checked) {
        soundtrack.play()
    }

    startButton.value = "Restart"

    setCounterTo(0)
})

window.addEventListener('ready', async (e) => {
    startButton.disabled = false
    startButton.style.background = "lawngreen"
    if (params.get("auto_start") === 'true') {
        window.dispatchEvent(new CustomEvent('start'))
    }
})

window.addEventListener('point', async (e) => {
    setCounterTo(counter + 1)
})

window.addEventListener('game_over', async (e) => {
    console.log("qua è il problema")

    quit()

    reload()
})

window.addEventListener('win', async (e) => {
    engine.win()
})

function reload() {
    let url = window.location.href.split('?')[0];

    // url += '?auto_start=true&fps=' + fpsDomElement.value + '&playMusic=' + playMusic.checked + '&showSkybox=' + skyboxElement.checked

    url += '?auto_start=true&playMusic=' + playMusic.checked + '&showSkybox=' + skyboxElement.checked

    window.location.href = url;
}

function quit() {
    engine.stop()

    soundtrack.pause();

    startButton.value = "Start"

    setCounterTo(0)
}

function setCounterTo(value) {
    counter = value;

    // console.log("new value of counter: " + counter)

    // counterElem.textContent = counter;
    counterElem.value = "Coins: " + counter
}


// Disable windows scrolls

function preventDefault(e) {
    e.preventDefault();
}

let keys = {32: 1};

function preventDefaultForScrollKeys(e) {
    if (keys[e.keyCode]) {
        preventDefault(e);
        return false;
    }
}

function disableScroll() {
    window.addEventListener('DOMMouseScroll', preventDefault, false); // older FF
    window.addEventListener('keydown', preventDefaultForScrollKeys, false);
}