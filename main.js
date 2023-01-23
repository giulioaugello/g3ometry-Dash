import {Engine} from "./engine/engine.js";
import {PlayerController} from "./engine/playerController.js";
import {ShadersManager} from "./engine/shadersManager.js";

let params = (new URL(document.location)).searchParams;

document.addEventListener("DOMContentLoaded", () => {
    // let fpsParam = params.get('fps')
    // if (fpsParam) {
    //     fpsDomElement.value = fpsParam
    // }

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

let screenSizeMediaQuery = window.matchMedia("(min-width: 320px) and (max-width: 480px)")
let spanValue = false
let icon = document.getElementById("icon")
showIconSettings(screenSizeMediaQuery, icon)

function showIconSettings(x, icon) {
    if (x.matches) { // If media query matches
        icon.style.display = '';
        document.getElementById("showSkybox").style.display = 'none';
        document.getElementById("showSkybox1").style.display = 'none';
        document.getElementById("playMusic").style.display = 'none';
        document.getElementById("playMusic1").style.display = 'none';
    } else {
        icon.style.display = 'none';
    }
}

icon.onclick = function showSettings(){
    if (!spanValue){
        console.log("ciao")
        spanValue = true
        icon.textContent = "arrow_circle_up";
        document.getElementById("showSkybox").style.display = '';
        document.getElementById("showSkybox1").style.display = '';
        document.getElementById("playMusic").style.display = '';
        document.getElementById("playMusic1").style.display = '';
    } else {
        spanValue = false
        icon.textContent = "arrow_circle_down";
        document.getElementById("showSkybox").style.display = 'none';
        document.getElementById("showSkybox1").style.display = 'none';
        document.getElementById("playMusic").style.display = 'none';
        document.getElementById("playMusic1").style.display = 'none';
    }
}

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
skyboxElement.addEventListener("change", () => {
    if (skyboxElement.checked) {
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
    engine.start(120)

    soundtrack.play()

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