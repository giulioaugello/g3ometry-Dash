import {MeshLoader} from "./meshLoader.js";
import {ShadersManager} from "./shadersManager.js";
import '../main.js'

export class Engine {
    constructor(id, photo) {
        this.meshlist = []
        this.gl = null;
        this.canvas = document.getElementById(id);

        this.gl = this.canvas.getContext("webgl", {antialias: true});

        if (!this.gl) {
            alert("This browser does not support opengl acceleration.")
            return;
        }

        // NEW TEST
        // this.gl.getExtension("OES_standard_derivatives");
        // this.gl.enable(this.gl.DEPTH_TEST);
        // this.prepareShadows()

        // OLD
        this.program = webglUtils.createProgramFromScripts(this.gl, ["vertex-shader", "fragment-shader"])
        this.gl.useProgram(this.program);

        this.photo = photo;

        this.loadMeshes()
    }

    async loadMeshes() {
        this.meshlist = [];

        this.loader = new MeshLoader(this.meshlist)

        await fetch("scene.json")
            .then(response => response.json())
            .then(async scene => {
                for (const obj of scene.objs) {
                    // Loads up the meshes using the MeshLoader object.
                    await this.loader.load(obj.path, this.gl, obj.name, obj.isPlayer, obj.isBall, obj.collider_type, obj.dim, obj.coords, !!(obj.isPlayer && this.photo.getShowMyPhoto()))
                }
            })

        // Player
        this.player = this.meshlist.find(x => x.isPlayer)

        // Ball
        // this.ball = this.meshlist.find(x => x.isBall)
    }

    start(fps) {
        this.setFPS(fps);

        window.requestAnimationFrame(this.render.bind(this))
    }

    setFPS(fps) {
        this.delay = 1000 / fps;
        this.lastUpdateTimestamp = null;
        this.frame = -1;
    }

    render(timestamp) {
        if (this.lastUpdateTimestamp === null) {
            this.lastUpdateTimestamp = timestamp;
        }

        let seg = Math.floor((timestamp - this.lastUpdateTimestamp) / this.delay);

        if (seg > this.frame) {
            this.frame = seg;
            this.meshlist.forEach(elem => {
                elem.render(this.gl, this.program, this.get_player_coords());
            })

            // this.renderTest()
        }

        this.player.playerController.handler()
        this.player.compute_phys(this.meshlist)
        // this.ball.compute_phys(this.meshlist)

        this.animationId = requestAnimationFrame(this.render.bind(this))
    }

    get_player_coords() {
        let actor = this.meshlist.find(x => x.isPlayer)
        if (!actor) {
            return [0, 0, 0]
        }
        return [actor.position.z, actor.position.x, actor.position.y]
    }


    stop() {
        window.cancelAnimationFrame(this.animationId)

        this.loadMeshes()
    }
}