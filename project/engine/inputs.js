import {ShadersManager as shadersManager, ShadersManager} from "./shadersManager.js";

// user input queue
let queue = {x: {p: false, n: false}, z: {p: false, n: false}};
let obj = null;
let drag = false;
let old = {x: null, y: null};
let isSpaceTr = true

export class Inputs {

    constructor(object) {
        // Controller constructor, saves actor object inside itself.
        this.object = object;
        obj = object
        this.canvas = document.getElementById("canvas");
        this.add_event_listeners();

        this.mobileController();

        this.move = true;
    }

    add_event_listeners() {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
            window.addEventListener("touchstart", this.mouseDown, true)
            window.addEventListener("touchend", this.mouseUp, true)
            window.addEventListener("touchmove", this.mouseMove)
        } else {
            window.addEventListener("keydown", this.keyDown, true)
            window.addEventListener("keyup", this.keyUp, true)
            this.canvas.addEventListener("mousedown", this.mouseDown, true)
            this.canvas.addEventListener("mouseup", this.mouseUp, true)
            this.canvas.addEventListener("mousemove", this.mouseMove, true)
            this.canvas.addEventListener("wheel", this.wheelMove, true);
        }

        console.log("Controller installed.")
    }

    remove_event_listeners() {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
            window.removeEventListener("touchstart", this.mouseDown, true)
            window.removeEventListener("touchend", this.mouseUp, true)
            window.removeEventListener("touchmove", this.mouseMove)
        } else {
            window.removeEventListener("keydown", this.keyDown, true)
            window.removeEventListener("keyup", this.keyUp, true)
            this.canvas.removeEventListener("mousedown", this.mouseDown, true)
            this.canvas.removeEventListener("mouseup", this.mouseUp, true)
            this.canvas.removeEventListener("mousemove", this.mouseMove, true)
            this.canvas.removeEventListener("wheel", this.wheelMove, true);
        }

        console.log("Controller uninstalled.")
    }

    mobileController() {
        const controller_left = document.getElementById('controller_left');
        controller_left.addEventListener("touchstart", () => {
            queue.z.p = true;
        });

        controller_left.addEventListener("touchend", () => {
            queue.z.p = false;
        });

        const controller_jump = document.getElementById('controller_jump');
        controller_jump.addEventListener("touchstart", () => {
            if (isSpaceTr) {
                queue.x.n = true
            }
        });

        controller_jump.addEventListener("touchend", () => {
            queue.x.n = false
        });

        const controller_right = document.getElementById('controller_right');
        controller_right.addEventListener("touchstart", () => {
            queue.z.n = true;
        });

        controller_right.addEventListener("touchend", () => {
            queue.z.n = false;
        });
    }

    setSpace(boolSpace) {
        isSpaceTr = boolSpace
    }

    mouseMove(e) {
        // Basic mouse/touch movement interaction on drag.
        if (drag) {
            if (e instanceof TouchEvent) {
                e = e.changedTouches[0]
                old.x = e.clientX;
                old.y = e.clientY;
            } else {
                if (e.movementX > 0) {
                    // queue.x.n = true;
                    console.log("destra")
                    shadersManager.increaseCameraPositionAtIndexOfValue(0, 1)
                } else if (e.movementX < 0) {
                    // queue.x.p = true;
                    console.log("sinistra")
                    shadersManager.decreaseCameraPositionAtIndexOfValue(0, 1)
                }
            }
        }
    }

    mouseDown(e) {
        // Basic mouse/touch start of interaction
        if (e instanceof TouchEvent) {
            old.x = e.changedTouches[0].clientX;
            old.y = e.changedTouches[0].clientY;
        }
        drag = true;
    }

    mouseUp(e) {
        // Basic mouse/touch end of interaction
        drag = false;
        queue.z.p = queue.z.n = queue.x.n = queue.x.p = false
        old = {x: null, y: null};
    }

    getSpace() {
        return isSpaceTr
    }

    wheelMove(e) {
        if (e.deltaY < 0) {
            shadersManager.decreaseFieldOfViewRadiansOf(1)
        } else {
            shadersManager.increaseFieldOfViewRadiansOf(1)
        }
    }

    keyDown(e) {
        // Basic key press handling
        switch (e.keyCode) {
            case 32: // space
                if (isSpaceTr) {
                    console.log("down")
                    queue.x.n = true
                }
                break
            // case 83: // 's' ma METTERE QUELLO DI SOPRA
            //     if (isSpaceTr) {
            //         queue.x.n = true
            //     }
            //     break
            case 65: // a
                queue.z.p = true;
                break;
            case 68: // d
                queue.z.n = true
                break
            case 80: // p
                queue.x.p = true
                break
            case 74: // j
                //ShadersManager.increaseCameraPositionAtIndexOfValue(0, 0.5)
                break
            case 76: // l
                //ShadersManager.increaseCameraPositionAtIndexOfValue(0, -0.5)
                break
            case 86: // v
                // ShadersManager.increaseCameraPositionAtIndexOfValue(0, 2)
                break
            case 66: // b
                // ShadersManager.increaseCameraPositionAtIndexOfValue(1, 2)
                break
            case 78: // n
                // ShadersManager.increaseCameraPositionAtIndexOfValue(2, 2)
                break
        }

    }

    keyUp(e) {
        // Basic key lift handling
        switch (e.keyCode) {
            case 32: // space
                // isSpaceTr = false
                queue.x.n = false
                break
            // case 83: // s ma METTERE SPAZIO
            //     queue.x.n = false
            //     break
            case 65: // a
                queue.z.p = false;
                break;
            case 68: // d
                queue.z.n = false
                break
            case 80: // d
                queue.x.p = false
                break
        }
    }

    stopSpeed() {
        obj.speed.x = 0
        this.move = false;
    }

    handler() {
        // Based on queue, applies acceleration to selected axis.
        if (queue.x.n) { // space
            // obj.speed.y = 0.4
            if (isSpaceTr) {
                obj.speed.y = 0.4
            }
        } else if (queue.z.p) { // a
            obj.speed.x = 0
            obj.speed.z = -0.1
        } else if (queue.z.n) { // d
            obj.speed.x = 0
            obj.speed.z = 0.1
        } else if (queue.x.p) {
            obj.speed.x = -0.15
        } else {
            if (this.move) {
                obj.speed.x = 0.15
            }
            obj.speed.z = 0
        }

    }

    stopSpace(){
        window.removeEventListener("keydown", this.keyDown, true)
        queue.x.n = false
        setTimeout(() => {
            window.addEventListener("keydown", this.keyDown, true)
        }, 1000)
    }
}
