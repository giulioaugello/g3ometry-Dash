import {Engine} from "./engine/engine.js";
import {PlayerController} from "./engine/playerController.js";
import {ShadersManager} from "./engine/shadersManager.js";

// Engine
let engine = new Engine("canvas");

// Add gui elements
document.getElementById("gui").append(ShadersManager.generateGuiControls().domElement)

// Soundtrack
const soundtrack = document.getElementById("soundtrack");
soundtrack.src = "sound_effects/soundtrack.mp3";

// Counter
let counter;
const counterElem = document.querySelector('#counter');

// Start Button
const startButton = document.getElementById('startButton');
startButton.addEventListener('click', () => {
    if(startButton.value === "Restart"){
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

// FPS
const fpsDomElement = document.getElementById('fpsID');
fpsDomElement.addEventListener("change", () => {
    engine.setFPS(fpsDomElement.value)
});

// Skybox
const skyboxElement = document.getElementById('showSkybox');
skyboxElement.addEventListener("change", () => {
    if (skyboxElement.checked) {
        engine.setFPS(120)
        $('#fpsDiv').hide();
    } else {
        $('#fpsDiv').show();
    }
});

// Soundtrack
const playMusic = document.getElementById('playMusic')
playMusic.addEventListener('change', () => {
    if (playMusic.checked) {
        soundtrack.play()
    } else {
        soundtrack.pause()
    }
});

window.addEventListener('start', async (e) => {
    engine.start(fpsDomElement.value)

    soundtrack.play()

    startButton.value = "Restart"

    // setCounterTo(0)
})

window.addEventListener('ready', async (e) => {
    startButton.disabled = false

    let params = (new URL(document.location)).searchParams;

    if (params.get("param")) {
        window.dispatchEvent(new CustomEvent('start'))
    }
})

window.addEventListener('point', async (e) => {
    setCounterTo(counter + 1)
})

window.addEventListener('game_over', async (e) => {
    quit()

    reload()
})

window.addEventListener('win', async (e) => {
    engine.win()
})

function reload(){
    let url = window.location.href.split("&param")[0];

    if (url.indexOf('?') > -1) {
        url += '&param=1'
    } else {
        url += '?param=1'
    }

    window.location.href = url;
}

function quit(){
    engine.stop()

    soundtrack.pause();

    startButton.value = "Start"

    setCounterTo(0)

    console.log("ciao")

    skyboxElement.checked = false;
}

function setCounterTo(value){
    counter = value;

    console.log("new value of counter: " + counter)

    counterElem.textContent = counter;
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