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
                elem.render(this.gl, this.program);
            })

            // this.renderTest()
        }

        this.player.playerController.handler()
        this.player.compute_phys(this.meshlist)
        // this.ball.compute_phys(this.meshlist)

        this.animationId = requestAnimationFrame(this.render.bind(this))
    }

    // prepareShadows() {
    //     // Obj containing all variables used for shadows
    //     this.shadow = [];
    //
    //     // Program used to draw from the light perspective
    //     this.colorProgramInfo = webglUtils.createProgramFromScripts(this.gl, ['color-vertex-shader', 'color-fragment-shader']);
    //
    //     // Program used to draw from the camera perspective
    //     this.textureProgramInfo = webglUtils.createProgramFromScripts(this.gl, ['vertex-shader-3d', 'fragment-shader-3d']);
    //
    //     // Shadow map texture
    //     this.shadow.depthTexture = this.gl.createTexture();
    //     this.shadow.depthTextureSize = 4096; // Texture resolution
    //     this.gl.bindTexture(this.gl.TEXTURE_2D, this.shadow.depthTexture);
    //     this.gl.texImage2D(
    //         this.gl.TEXTURE_2D,                 // target
    //         0,                                  // mip level
    //         this.gl.DEPTH_COMPONENT,            // internal format
    //         this.shadow.depthTextureSize,       // width
    //         this.shadow.depthTextureSize,       // height
    //         0,                                  // border
    //         this.gl.DEPTH_COMPONENT,            // format
    //         this.gl.UNSIGNED_INT,               // type
    //         null);                              // data
    //     this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
    //     this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
    //     this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    //     this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    //
    //     this.shadow.depthFramebuffer = this.gl.createFramebuffer();
    //     this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.shadow.depthFramebuffer);
    //     this.gl.framebufferTexture2D(
    //         this.gl.FRAMEBUFFER,            // target
    //         this.gl.DEPTH_ATTACHMENT,       // attachment point
    //         this.gl.TEXTURE_2D,             // texture target
    //         this.shadow.depthTexture,       // texture
    //         0);                       // mip level
    //
    //     // Shadow settings
    //     this.shadow.enable = false;
    //     this.shadow.fov = 60;
    //     this.shadow.projWidth = 2;
    //     this.shadow.projHeight = 2;
    //     this.shadow.zFarProj = 20;
    //     this.shadow.bias = -0.0001;
    //     this.shadow.showFrustum = false;
    // }

    // renderTest() {
    //     this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    //
    //     this.gl.enable(this.gl.CULL_FACE);
    //     this.gl.enable(this.gl.DEPTH_TEST);
    //     this.gl.enable(this.gl.BLEND);
    //     this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    //
    //     let projection_matrix = ShadersManager.getProjectionMatrix(this.gl.canvas.clientWidth, this.gl.canvas.clientHeight)
    //     let view_matrix = ShadersManager.getViewMatrix()
    //
    //     const lightWorldMatrix = m4.lookAt(
    //         [10, 5, 2],       // position
    //         [1, 1, 1],      // target
    //         [0, 1, 0],                  // up
    //     );
    //
    //     const lightProjectionMatrix = m4.perspective(
    //         ShadersManager.degToRad(this.shadow.fov),
    //         this.shadow.projWidth / this.shadow.projHeight,
    //         0.5,                        // near
    //         this.shadow.zFarProj);     // far
    //
    //     let sharedUniforms = {
    //         u_view: m4.inverse(lightWorldMatrix),                  // View Matrix
    //         u_projection: lightProjectionMatrix,                   // Projection Matrix
    //         u_bias: this.shadow.bias,
    //         u_textureMatrix: m4.identity(),
    //         u_projectedTexture: this.shadow.depthTexture,
    //         u_reverseLightDirection: lightWorldMatrix.slice(8, 11),
    //     };
    //
    //     // draw to the depth texture
    //     this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.shadow.depthFramebuffer);
    //     this.gl.viewport(0, 0, this.shadow.depthTextureSize, this.shadow.depthTextureSize);
    //     this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    //
    //     this.meshlist.forEach(m => {
    //         m.render(this.gl, this.colorProgramInfo, sharedUniforms, true);
    //     });
    //
    //     this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    //     this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    //     this.gl.clearColor(0, 0, 0, 1);
    //     this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    //
    //     let textureMatrix = m4.identity();
    //     textureMatrix = m4.translate(textureMatrix, 0.5, 0.5, 0.5);
    //     textureMatrix = m4.scale(textureMatrix, 0.5, 0.5, 0.5);
    //     textureMatrix = m4.multiply(textureMatrix, lightProjectionMatrix);
    //     // use the inverse of this world matrix to make
    //     // a matrix that will transform other positions
    //     // to be relative this world space.
    //     textureMatrix = m4.multiply(textureMatrix, m4.inverse(lightWorldMatrix));
    //
    //
    //     sharedUniforms = {
    //         u_view: ShadersManager.getViewMatrix(),
    //         u_projection: projection_matrix,
    //         u_bias: this.shadow.bias,
    //         u_textureMatrix: textureMatrix,
    //         u_projectedTexture: this.shadow.depthTexture,
    //         u_reverseLightDirection: lightWorldMatrix.slice(8, 11),
    //         u_worldCameraPosition: ShadersManager.getCameraPosition(),
    //     };
    //
    //     this.meshlist.forEach(m => {
    //         m.render(this.gl, this.textureProgramInfo, sharedUniforms);
    //     });
    // }

    stop() {
        window.cancelAnimationFrame(this.animationId)

        this.loadMeshes()
    }
}