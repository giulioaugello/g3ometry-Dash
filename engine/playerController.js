// Common variables in module

// User input queue
import {ShadersManager as shadersManager, ShadersManager} from "./shadersManager.js";


let queue = {x: {p: false, n: false}, z: {p: false, n: false}};
let obj = null;
// let canvas = null;
let drag = false;
let old = {x: null, y: null};
let pressed = false;
let isSpaceTr = true

export class PlayerController {

    constructor(object) {
        // Controller constructor, saves actor object inside itself.
        this.object = object;
        obj = object
        // canvas = document.getElementById("canvas");
        this.install();

        this.move = true;
    }

    install() {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
            window.addEventListener("touchstart", this.mouseDown, true)
            window.addEventListener("touchend", this.mouseUp, true)
            window.addEventListener("touchmove", this.mouseMove)
        } else {
            window.addEventListener("keydown", this.keyDown, true)
            window.addEventListener("keyup", this.keyUp, true)
            window.addEventListener("mousedown", this.mouseDown, true)
            window.addEventListener("mouseup", this.mouseUp, true)
            window.addEventListener("mousemove", this.mouseMove, true)
            window.addEventListener("wheel", this.wheelMove, true);
        }

        console.log("Controller installed.")
    }

    uninstall() {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
            window.removeEventListener("touchstart", this.mouseDown, true)
            window.removeEventListener("touchend", this.mouseUp, true)
            window.removeEventListener("touchmove", this.mouseMove)
        } else {
            window.removeEventListener("keydown", this.keyDown, true)
            window.removeEventListener("keyup", this.keyUp, true)
            window.removeEventListener("mousedown", this.mouseDown, true)
            window.removeEventListener("mouseup", this.mouseUp, true)
            window.removeEventListener("mousemove", this.mouseMove, true)
        }


        console.log("Controller uninstalled.")
    }

    setSpace(boolSpace) {
        isSpaceTr = boolSpace
    }

    mouseMove(e) {
        // Basic mouse/touch movement interaction on drag.
        if (drag) {
            if (e instanceof TouchEvent) {
                e = e.changedTouches[0]
                if (e.clientX > old.x) {
                    // queue.x.n = true;
                    console.log("ciao1")
                } else if (e.clientX < old.x) {
                    // queue.x.p = true;
                } else {
                    // queue.x.n = queue.x.p = false
                    console.log("ciao2")
                }
                if (e.clientY < old.y) {
                    // queue.z.p = true;
                    console.log("ciao3")
                } else if (e.clientY > old.y) {
                    // queue.z.n = true;
                    console.log("ciao4")
                } else {
                    // queue.z.p = queue.z.n = false
                    console.log("ciao5")
                }
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
                } else {
                    // queue.x.n = queue.x.p = false
                    console.log("ciao8")
                }
                if (e.movementY < 0) {
                    // queue.z.p = true;
                    console.log("ciao9")
                } else if (e.movementY > 0) {
                    // queue.z.n = true;
                    console.log("ciao10")
                } else {
                    // queue.z.p = queue.z.n = false
                    console.log("ciao11")
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
            shadersManager.increaseFieldOfViewRadiansOf(1)
        } else {
            shadersManager.decreaseFieldOfViewRadiansOf(1)
        }
    }

    keyDown(e) {
        // Basic key press handling
        switch (e.keyCode) {
            case 32: // space
                // console.log("before if", isSpaceTr)
                queue.x.n = true
                // if (isSpaceTr) {
                //     // isSpaceTr = false
                //     queue.x.n = true
                //     // console.log("inside if", isSpaceTr)
                // }

                // console.log("after if", isSpaceTr)
                break

            // case 83: // 's' ma METTERE QUELLO DI SOPRA
            //     queue.x.n = true
            //     break
            case 65: // a
                queue.z.p = true;
                break;
            case 68: // d
                queue.z.n = true
                break
            case 80: // d
                queue.x.p = true
                break

            // case 83: // s
            //     queue.z.n = true
            //     break
            // case 87: // w
            //     queue.z.p = true
            //     break
            // case 73: // i
            //     ShadersManager.upAndDown(1)
            //     break
            // case 75: // k
            //     ShadersManager.upAndDown(-1)
            //     break
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
            // case 27: // esc
            //     setTimeout(function () {
            //         window.location.reload();
            //     })
            //     break
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
            // case 87: // w
            //     queue.z.p = false
            //     break
            case 65: // a
                queue.z.p = false;
                break;
            // case 83: // s
            //     queue.z.n = false
            //     break
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
        // console.log(obj.position.x)
        // console.log(obj.position.y)
        // console.log(obj.position.z)

        if (queue.x.n) { // space
            // obj.speed.y = 0.1

            // if (obj.speed.y <= 0){
            //     obj.speed.y = 0.4
            // }else{
            //     console.log("ciao")
            // }

            obj.speed.y = 0.4
            // if (isSpaceTr) {
            //     obj.speed.y = 0.4
            // }

        } else if (queue.z.p) { // a

            obj.speed.x = 0
            obj.speed.z = -0.1


        } else if (queue.z.n) { // d

            obj.speed.x = 0
            obj.speed.z = 0.1

            // else {
            //     obj.speed.x = 0.1
            //     obj.speed.z = 0
            // }

        } else if (queue.x.p) {

            obj.speed.x = -0.15

        } else {
            // console.log("!zn")
            if (this.move) {
                obj.speed.x = 0.15
            }

            obj.speed.z = 0
        }


        // if (queue.x.n) {
        //     obj.accel.x = 0.3
        // }
        // if (queue.z.p) {
        //     obj.accel.z = -0.3
        // }

        // if (queue.x.p) {
        //     obj.speed.y = -1
        // }


        // if (queue.z.p) {
        //     obj.speed.z = -0.3
        // }
        // if (queue.z.n) {
        //     obj.speed.z = 0.3
        // }
    }
}
