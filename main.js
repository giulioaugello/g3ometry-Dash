import {Engine} from "./engine/engine.js";
import {PlayerController} from "./engine/playerController.js";
import {ShadersManager} from "./engine/shadersManager.js";

export class Photo {
    // constructor() {
    //     this.showMyPhoto = false;
    // }

    // toggleShowMyPhoto(){
    //     this.showMyPhoto = !this.showMyPhoto
    // }

    getShowMyPhoto() {
        // return this.showMyPhoto

        return document.getElementById('toggleMyPhoto').checked
    }
}

let photo = new Photo()
// const toggleMyPhotoButton = document.getElementById('toggleMyPhoto');
// toggleMyPhotoButton.addEventListener('click', () => {
//     photo.toggleShowMyPhoto()
// });

// Engine
let engine = new Engine("canvas", photo);

// Add gui elements
document.getElementById("gui").append(ShadersManager.generateGuiControls().domElement)

// Sound effects
// const bouncing = document.getElementById("bouncing");
// // const bouncingSrc = "sound_effects/bouncing.mp3";
// const soundtracks = document.getElementById("soundtracks");
// const mainThemeSrc = "sound_effects/main_theme.mp3";
// const rohanSrc = "sound_effects/rohan.mp3";
// const theShireSrc = "sound_effects/the_Shire.mp3";

// Counter
let counter;
const counterElem = document.querySelector('#counter');

const startTimerButton = document.getElementById('startTimerButton');
startTimerButton.addEventListener('click', () => {
    startTimerButton.blur();
    disableScroll();
    window.dispatchEvent(new CustomEvent('start'))
});

// function changeSoundtracks(src) {
//     if (shouldMusicBePlayed()) {
//         soundtracks.src = src
//         soundtracks.play();
//     }
// }

// window.addEventListener('hit', async (e) => {
//     if (shouldMusicBePlayed()) {
//         bouncing.play()
//     }
// })

window.addEventListener('point', async (e) => {
    counter++;
    console.log(counter)
    counterElem.textContent = counter;

    // switch (counter) {
    //     case 5:
    //         changeSoundtracks(mainThemeSrc)
    //         break;
    //     case 10:
    //         changeSoundtracks(rohanSrc)
    //         break;
    // }
})

window.addEventListener('game_over', async (e) => {

    //     startTimerButton.value = "Start"
    //     engine.stop()
    //     alert("Il tuo punteggio è " + counter)


    alert("end")
    engine.stop()
})

// FPS Listener
const fpsDomElement = document.getElementById('fpsID');
fpsDomElement.addEventListener("change", () => {
    engine.setFPS(fpsDomElement.value)
});

// Skybox Listener
const skyboxElement = document.getElementById('showSkybox');
skyboxElement.addEventListener("change", () => {
    if (skyboxElement.checked) {
        engine.setFPS(120)
        engine.startSkybox()
        $('#fpsDiv').hide();
    } else {
        engine.stopSkybox()
        $('#fpsDiv').show();
    }
});

window.addEventListener('start', async (e) => {
    startTimerButton.value = "Restart"

    engine.stop()

    counter = 0;

    counterElem.textContent = counter;

    engine.start(fpsDomElement.value)

    // changeSoundtracks(theShireSrc)
})
const al = document.getElementById('al');
al.addEventListener("click", () => {
    alert("ciao")
});

/**
 * Remove a default event action
 * @param {*} e is the event to trigger
 */
function preventDefault(e) {
    e.preventDefault();
}

/**
 * Remove a default event action related to a key
 * @param {*} e is the event of interest
 * @returns false if it trigger an interested key
 */
// modern Chrome requires { passive: false } when adding event
// let supportsPassive = false;
// try {
//     window.addEventListener("test", null, Object.defineProperty({}, 'passive', {
//         get: function () { supportsPassive = true; }
//     }));
// } catch (e) { }
let keys = {32: 1};
// let wheelOpt = supportsPassive ? { passive: false } : false;
// let wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';

function preventDefaultForScrollKeys(e) {
    if (keys[e.keyCode]) {
        preventDefault(e);
        return false;
    }
}

/**
 * Disable windows scrolls
 */
function disableScroll() {
    window.addEventListener('DOMMouseScroll', preventDefault, false); // older FF
    // window.addEventListener(wheelEvent, preventDefault, wheelOpt); // modern desktop
    // window.addEventListener('touchmove', preventDefault, wheelOpt); // mobile
    window.addEventListener('keydown', preventDefaultForScrollKeys, false);
}

// const playMusic = document.getElementById('playMusic')
//
// function shouldMusicBePlayed() {
//     return playMusic.checked
// }
//
// playMusic.addEventListener('change', () => {
//     if (shouldMusicBePlayed()) {
//         changeSoundtracks(theShireSrc)
//     } else {
//         soundtracks.pause()
//     }
// });

// // TIMER
// const timeLimit = 3000;
// let timePassed = 0;
// let timeLeft = timeLimit;
// let timerInterval = null;
//
// function onTimesUp() {
//     document.getElementById("timer").innerHTML = "00:00";
//
//     clearInterval(timerInterval);
//
//     timerInterval = null;
//
//     window.dispatchEvent(new CustomEvent('game_over'))
// }
//
// function startTimer() {
//     if (!timerInterval) {
//         timerInterval = setInterval(() => {
//             timePassed = timePassed += 1;
//             timeLeft = timeLimit - timePassed;
//             document.getElementById("timer").innerHTML = formatTime(timeLeft);
//
//             if (timeLeft === 0) {
//                 onTimesUp();
//             }
//         }, 1000);
//     }
// }
//
// function formatTime(time) {
//     const minutes = Math.floor(time / 60);
//     let seconds = time % 60;
//
//     if (seconds < 10) {
//         seconds = `0${seconds}`;
//     }
//
//     return `${minutes}:${seconds}`;
// }
//
// function pauseTimer() {
//     onTimesUp();
// }
//
// function resumeTimer() {
//     if (!timerInterval)
//         startTimer();
// }
//
// function resetTimer() {
//     timePassed = 0;
//     timeLeft = timeLimit;
//     timerInterval = null;
//
//     document.getElementById("timer").innerHTML = formatTime(timeLeft);
// }