// Common variables in module

// User input queue
import {ShadersManager} from "./shadersManager.js";


let queue = {x: {p: false, n: false}, z: {p: false, n: false}};
let obj = null;
// let canvas = null;
let drag = false;
let old = {x: null, y: null};
let pressed = false;
let isSpaceTr = true

export class PlayerController {

    constructor(object) {
        this.test("stick", 64, 8, this.mouseDown, this.mouseUp, this.mouseMove);

        // Controller constructor, saves actor object inside itself.
        this.object = object;
        obj = object
        // canvas = document.getElementById("canvas");
        this.install();
    }

    install() {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
            window.addEventListener("touchstart", this.mouseDown, true)
            window.addEventListener("touchend", this.mouseUp, true)
            window.addEventListener("touchmove", this.mouseMove)
        } else {
            window.addEventListener("keydown", this.keyDown, true)
            window.addEventListener("keyup", this.keyUp, true)
            // window.addEventListener("mousedown", this.mouseDown, true)
            // window.addEventListener("mouseup", this.mouseUp, true)
            // window.addEventListener("mousemove", this.mouseMove, true)
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
            // window.removeEventListener("mousedown", this.mouseDown, true)
            // window.removeEventListener("mouseup", this.mouseUp, true)
            // window.removeEventListener("mousemove", this.mouseMove, true)
        }


        console.log("Controller uninstalled.")
    }

    setSpace(boolSpace){
        isSpaceTr = boolSpace
    }

    mouseMove(e) {
        // Basic mouse/touch movement interaction on drag.
        if (drag) {
            if (e instanceof TouchEvent) {
                e = e.changedTouches[0]
                if (e.clientX > old.x) {
                    queue.x.n = true;
                } else if (e.clientX < old.x) {
                    queue.x.p = true;
                } else queue.x.n = queue.x.p = false
                if (e.clientY < old.y) {
                    queue.z.p = true;
                } else if (e.clientY > old.y) {
                    queue.z.n = true;
                } else queue.z.p = queue.z.n = false
                old.x = e.clientX;
                old.y = e.clientY;
            } else {
                if (e.movementX > 0) {
                    queue.x.n = true;
                } else if (e.movementX < 0) {
                    queue.x.p = true;
                } else queue.x.n = queue.x.p = false
                if (e.movementY < 0) {
                    queue.z.p = true;
                } else if (e.movementY > 0) {
                    queue.z.n = true;
                } else queue.z.p = queue.z.n = false
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

    getSpace(){
        return isSpaceTr
    }

    keyDown(e) {
        // Basic key press handling
        switch (e.keyCode) {
            case 32: // space
                // console.log("before if", isSpaceTr)

                if (isSpaceTr){
                    // isSpaceTr = false
                    queue.x.n = true
                    // console.log("inside if", isSpaceTr)
                }

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
                ShadersManager.increaseCameraPositionAtIndexOfValue(0, 2)
                break
            case 66: // b
                ShadersManager.increaseCameraPositionAtIndexOfValue(1, 2)
                break
            case 78: // n
                ShadersManager.increaseCameraPositionAtIndexOfValue(2, 2)
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
        }
    }

    handler() {
        // Based on queue, applies acceleration to selected axis.
        // console.log(obj.position.x)
        // console.log(obj.position.y)
        // console.log(obj.position.z)

        if (queue.x.n) { // s
            // obj.speed.y = 0.1

            // if (obj.speed.y <= 0){
            //     obj.speed.y = 0.4
            // }else{
            //     console.log("ciao")
            // }

            if (isSpaceTr){
                // obj.speed.y = 0.4
                obj.speed.y = 0.4
            }

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

        } else {
            // console.log("!zn")
            obj.speed.x = 0.15
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


    test(stickID, maxDistance, deadzone, mouseDown, mouseUp, mouseMove) {
        // stickID: ID of HTML element (representing joystick) that will be dragged
        // maxDistance: maximum amount joystick can move in any direction
        // deadzone: joystick must move at least this amount from origin to register value change

        let stick = document.getElementById(stickID);

        // location from which drag begins, used to calculate offsets
        this.dragStart = null;

        // track touch identifier in case multiple joysticks present
        this.touchId = null;

        this.active = false;
        this.value = {x: 0, y: 0};

        let self = this;

        function handleDown(event) {
            self.active = true;

            // all drag movements are instantaneous
            stick.style.transition = '0s';

            // touch event fired before mouse event; prevent redundant mouse event from firing
            event.preventDefault();

            if (event.changedTouches) {
                self.dragStart = {x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY};
            } else {
                self.dragStart = {x: event.clientX, y: event.clientY};
            }


            // if this is a touch event, keep track of which one
            if (event.changedTouches) {
                self.touchId = event.changedTouches[0].identifier;
            }


            mouseDown(event)
        }

        function handleMove(event) {
            if (!self.active) {
                return;
            }

            // if this is a touch event, make sure it is the right one
            // also handle multiple simultaneous touchmove events
            let touchmoveId = null;
            if (event.changedTouches) {
                for (let i = 0; i < event.changedTouches.length; i++) {
                    if (self.touchId === event.changedTouches[i].identifier) {
                        touchmoveId = i;
                        event.clientX = event.changedTouches[i].clientX;
                        event.clientY = event.changedTouches[i].clientY;
                    }
                }

                if (touchmoveId == null) {
                    return;
                }
            }

            const xDiff = event.clientX - self.dragStart.x;
            const yDiff = event.clientY - self.dragStart.y;
            const angle = Math.atan2(yDiff, xDiff);
            const distance = Math.min(maxDistance, Math.hypot(xDiff, yDiff));
            const xPosition = distance * Math.cos(angle);
            const yPosition = distance * Math.sin(angle);

            // move stick image to new position
            stick.style.transform = `translate3d(${xPosition}px, ${yPosition}px, 0px)`;

            // deadzone adjustment
            const distance2 = (distance < deadzone) ? 0 : maxDistance / (maxDistance - deadzone) * (distance - deadzone);
            const xPosition2 = distance2 * Math.cos(angle);
            const yPosition2 = distance2 * Math.sin(angle);
            const xPercent = parseFloat((xPosition2 / maxDistance).toFixed(4));
            const yPercent = parseFloat((yPosition2 / maxDistance).toFixed(4));

            self.value = {x: xPercent, y: yPercent};

            mouseMove(event)
        }

        function handleUp(event) {
            if (!self.active) return;

            // if this is a touch event, make sure it is the right one
            if (event.changedTouches && self.touchId != event.changedTouches[0].identifier) return;

            // transition the joystick position back to center
            stick.style.transition = '.2s';
            stick.style.transform = `translate3d(0px, 0px, 0px)`;

            // reset everything
            self.value = {x: 0, y: 0};
            self.touchId = null;
            self.active = false;

            mouseUp(event)
        }

        // stick.addEventListener('mousedown', handleDown);
        stick.addEventListener('touchstart', handleDown);
        stick.addEventListener('touchmove', handleMove, {passive: false});
        stick.addEventListener('touchend', handleUp);


    }

}
