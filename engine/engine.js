import {MeshLoader} from "./meshLoader.js";
import "./skybox.js";
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
        // this.program = webglUtils.createProgramFromScripts(this.gl, ["vertex-shader", "fragment-shader"])
        // this.gl.useProgram(this.program);

        // this.program = webglUtils.createProgramInfo(this.gl, ["vertex-shader", "fragment-shader"]);

        // this.skyboxProgramInfo = webglUtils.createProgramInfo(
        //     this.gl, ["vertex-shader-skybox", "fragment-shader-skybox"]);


        // create buffers and fill with vertex data
        this.quadBufferInfo = this.createXYQuadBufferInfo(this.gl);
        // Create a texture.
        this.texture = this.createSkyboxTexture(this.gl)

        this.skyboxProgramInfo = webglUtils.createProgramFromScripts(this.gl, ["vertex-shader-skybox", "fragment-shader-skybox"])
        // console.log(this.skyboxProgramInfo)
        // this.skyboxProgramInfo = webglUtils.createProgramInfo(this.gl, ["vertex-shader-skybox", "fragment-shader-skybox"])
        // this.gl.useProgram(this.skyboxProgramInfo)


        this.positionLocation = this.gl.getAttribLocation(this.skyboxProgramInfo, "a_position");

        // lookup uniforms
        this.skyboxLocation = this.gl.getUniformLocation(this.skyboxProgramInfo, "u_skybox");
        this.viewDirectionProjectionInverseLocation =
            this.gl.getUniformLocation(this.skyboxProgramInfo, "u_viewDirectionProjectionInverse");

        // Create a buffer for positions
        this.positionBuffer = this.gl.createBuffer();

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

        window.requestAnimationFrame(this.drawScene.bind(this))
        // window.requestAnimationFrame(this.render.bind(this))
        // window.requestAnimationFrame(this.sky.bind(this))

        // window.requestAnimationFrame(this.renderSkybox.bind(this))
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
        return [actor.position.z, actor.position.x, 10]
    }

    // Fill the buffer with the values that define a quad.
    setGeometry() {
        let positions = new Float32Array(
            [
                -1, -1,
                1, -1,
                -1, 1,
                -1, 1,
                1, -1,
                1, 1,
            ]);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);
    }

    createSkyboxTexture(gl) {
        let skyboxTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);

        const faceInfos = [
            {
                target: this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
                url: 'obj/skybox/top.png',
            },
            {
                target: this.gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
                url: 'obj/skybox/bottom.png',
            },
            {
                target: this.gl.TEXTURE_CUBE_MAP_POSITIVE_X,
                url: 'obj/skybox/right.png',
            },
            {
                target: this.gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
                url: 'obj/skybox/left.png',
            },
            {
                target: this.gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
                url: 'obj/skybox/front.png',
            },
            {
                target: this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
                url: 'obj/skybox/back.png',
            },
        ];
        faceInfos.forEach((faceInfo) => {
            const {target, url} = faceInfo;

            // Upload the canvas to the cubemap face.
            const level = 0;
            const internalFormat = this.gl.RGBA;
            const width = 1024;
            const height = 1024;
            const format = this.gl.RGBA;
            const type = this.gl.UNSIGNED_BYTE;

            // setup each face so it's immediately renderable
            this.gl.texImage2D(target, level, internalFormat, width, height, 0, format, type, null);

            // Asynchronously load an image
            const image = new Image();
            image.src = url;
            image.crossOrigin = "anonymous"
            image.addEventListener('load', function () {
                // Now that the image has loaded make copy it to the texture.
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);
                gl.texImage2D(target, level, internalFormat, format, type, image);
                gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
            });
        });

        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

        return skyboxTexture;
    }


    // sky() {
    //     requestAnimationFrame(this.drawScene);
    // }
    //
    // // Draw the scene.
    // drawScene(time) {
    //     function radToDeg(r) {
    //         return r * 180 / Math.PI;
    //     }
    //
    //     function degToRad(d) {
    //         return d * Math.PI / 180;
    //     }
    //     var then = 0;
    //     var spinCamera = true;
    //     var cameraYRotationRadians = degToRad(0);
    //     var fieldOfViewRadians = degToRad(60);
    //     // convert to seconds
    //     time *= 0.001;
    //     // Subtract the previous time from the current time
    //     var deltaTime = time - then;
    //     // Remember the current time for the next frame.
    //     then = time;
    //     webglUtils.resizeCanvasToDisplaySize(this.gl.canvas);
    //
    //     // Tell WebGL how to convert from clip space to pixels
    //     this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    //
    //     this.gl.enable(this.gl.CULL_FACE);
    //     this.gl.enable(this.gl.DEPTH_TEST);
    //
    //     // Clear the canvas AND the depth buffer.
    //     this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    //
    //     // Compute the projection matrix
    //     var aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
    //     var projectionMatrix =
    //         m4.perspective(fieldOfViewRadians, aspect, 1, 2000);
    //
    //     // camera going in circle 2 units from origin looking at origin
    //     var cameraPosition = [Math.cos(time * .1) * 2, 0, Math.sin(time * .1) * 2];
    //     var target = [0, 0, 0];
    //     var up = [0, 1, 0];
    //     // Compute the camera's matrix using look at.
    //     var cameraMatrix = m4.lookAt(cameraPosition, target, up);
    //
    //     // Make a view matrix from the camera matrix.
    //     var viewMatrix = m4.inverse(cameraMatrix);
    //
    //     // Rotate the cube around the x axis
    //     var worldMatrix = m4.xRotation(time * 0.11);
    //
    //     // We only care about direciton so remove the translation
    //     var viewDirectionMatrix = m4.copy(viewMatrix);
    //     viewDirectionMatrix[12] = 0;
    //     viewDirectionMatrix[13] = 0;
    //     viewDirectionMatrix[14] = 0;
    //
    //     var viewDirectionProjectionMatrix = m4.multiply(
    //         projectionMatrix, viewDirectionMatrix);
    //     var viewDirectionProjectionInverseMatrix =
    //         m4.inverse(viewDirectionProjectionMatrix);
    //
    //
    //     // draw the skybox
    //
    //     // let our quad pass the depth test at 1.0
    //     this.gl.depthFunc(this.gl.LEQUAL);
    //
    //     // this.gl.useProgram(this.skyboxProgramInfo.program);
    //     console.log(this.gl)
    //     console.log("---------------------")
    //     console.log(this.skyboxProgramInfo)
    //     console.log("---------------------")
    //     console.log(this.quadBufferInfo)
    //
    //     webglUtils.setBuffersAndAttributes(this.gl, this.skyboxProgramInfo, this.quadBufferInfo);
    //     webglUtils.setUniforms(this.skyboxProgramInfo, {
    //         u_viewDirectionProjectionInverse: viewDirectionProjectionInverseMatrix,
    //         u_skybox: this.texture,
    //     });
    //     webglUtils.drawBufferInfo(this.gl, this.quadBufferInfo);
    //
    //     requestAnimationFrame(this.drawScene);
    // }

    createXYQuadBufferInfo() {
        var xOffset = 0;
        var yOffset = 0;
        var size = 1;
        return {
            position: {
                numComponents: 2,
                data: [
                    xOffset + -1 * size, yOffset + -1 * size,
                    xOffset + 1 * size, yOffset + -1 * size,
                    xOffset + -1 * size, yOffset + 1 * size,
                    xOffset + 1 * size, yOffset + 1 * size,
                ],
            },
            normal: [
                0, 0, 1,
                0, 0, 1,
                0, 0, 1,
                0, 0, 1,
            ],
            texcoord: [
                0, 0,
                1, 0,
                0, 1,
                1, 1,
            ],
            indices: [0, 1, 2, 2, 1, 3],
        };
    }

    // sky() {
    //
    //
    //     requestAnimationFrame(this.drawScene.bind(this));
    //
    //
    // }

    // Draw the scene.
    drawScene(time) {

        console.log(this.gl)
        // look up where the vertex data needs to go.

        // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        // Put the positions in the buffer
        this.setGeometry(this.gl);

        // Create a texture.
        this.createSkyboxTexture(this.gl)

        function radToDeg(r) {
            return r * 180 / Math.PI;
        }

        function degToRad(d) {
            return d * Math.PI / 180;
        }

        var fieldOfViewRadians = degToRad(60);
        var cameraYRotationRadians = degToRad(0);

        var spinCamera = true;
        // Get the starting time.
        var then = 0;
        // convert to seconds
        time *= 0.001;
        // Subtract the previous time from the current time
        var deltaTime = time - then;
        // Remember the current time for the next frame.
        then = time;

        webglUtils.resizeCanvasToDisplaySize(this.gl.canvas);

        // Tell WebGL how to convert from clip space to pixels
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

        this.gl.enable(this.gl.CULL_FACE);
        this.gl.enable(this.gl.DEPTH_TEST);

        // Clear the canvas AND the depth buffer.
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // Tell it to use our program (pair of shaders)
        this.gl.useProgram(this.skyboxProgramInfo);

        // Turn on the position attribute
        this.gl.enableVertexAttribArray(this.positionLocation);

        // Bind the position buffer.
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);

        // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        var size = 2;          // 2 components per iteration
        var type = this.gl.FLOAT;   // the data is 32bit floats
        var normalize = false; // don't normalize the data
        var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0;        // start at the beginning of the buffer
        this.gl.vertexAttribPointer(
            this.positionLocation, size, type, normalize, stride, offset);

        // Compute the projection matrix
        var aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
        var projectionMatrix =
            m4.perspective(fieldOfViewRadians, aspect, 1, 2000);

        // camera going in circle 2 units from origin looking at origin
        var cameraPosition = [Math.cos(time * .1), 0, Math.sin(time * .1)];
        var target = [0, 0, 0];
        var up = [0, 1, 0];
        // Compute the camera's matrix using look at.
        var cameraMatrix = m4.lookAt(cameraPosition, target, up);

        // Make a view matrix from the camera matrix.
        var viewMatrix = m4.inverse(cameraMatrix);

        // We only care about direciton so remove the translation
        viewMatrix[12] = 0;
        viewMatrix[13] = 0;
        viewMatrix[14] = 0;

        var viewDirectionProjectionMatrix =
            m4.multiply(projectionMatrix, viewMatrix);
        var viewDirectionProjectionInverseMatrix =
            m4.inverse(viewDirectionProjectionMatrix);

        // Set the uniforms
        this.gl.uniformMatrix4fv(
            this.viewDirectionProjectionInverseLocation, false,
            viewDirectionProjectionInverseMatrix);

        // Tell the shader to use texture unit 0 for u_skybox
        this.gl.uniform1i(this.skyboxLocation, 0);

        // let our quad pass the depth test at 1.0
        this.gl.depthFunc(this.gl.LEQUAL);

        // Draw the geometry.
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 1 * 6);

        requestAnimationFrame(this.drawScene);
    }

    stop() {
        window.cancelAnimationFrame(this.animationId)

        this.loadMeshes()
    }
}