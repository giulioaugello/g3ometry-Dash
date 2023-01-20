import {MeshLoader} from "./meshLoader.js";
import {ShadersManager as shadersManager, ShadersManager} from "./shadersManager.js";
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

        // this.program = webglUtils.createProgramInfo(this.gl, ["vertex-shader", "fragment-shader"]);
        // this.gl.useProgram(this.program.program);

        this.program = webglUtils.createProgramFromScripts(this.gl, ["vertex-shader", "fragment-shader"])
        // this.gl.useProgram(this.program);

        // // SKYBOX
        this.skyboxProgram = webglUtils.createProgramFromScripts(this.gl, ["vertex-shader-skybox", "fragment-shader-skybox"]);
        this.sky()

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
        // this.startSkybox()
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
        }

        // this.drawScene()

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

    stop() {
        window.cancelAnimationFrame(this.animationId)
        // this.stopSkybox()

        this.loadMeshes()
    }
    // SKYBOX

    sky() {
        // look up where the vertex data needs to go.
        this.posLocation = this.gl.getAttribLocation(this.skyboxProgram, "a_position");

        // lookup uniforms
        this.skyboxLocation = this.gl.getUniformLocation(this.skyboxProgram, "u_skybox");
        this.viewDirectionProjectionInverseLocation = this.gl.getUniformLocation(this.skyboxProgram, "u_viewDirectionProjectionInverse");

        // Create a buffer for positions
        this.posBuffer = this.gl.createBuffer();
        // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.posBuffer);
        // Put the positions in the buffer
        this.setGeometry(this.gl);

        // Create a texture.
        var texture = this.createSkyboxTexture(this.gl)

        this.fieldOfViewRadians = shadersManager.degToRad(60);
        this.cameraYRotationRadians = shadersManager.degToRad(0);

        this.spinCamera = true;
        // Get the starting time.
        this.then = 0;

        requestAnimationFrame(this.drawScene.bind(this));
    }

    // Draw the scene.
    drawScene(time) {
        // convert to seconds
        time *= 0.001;
        // Subtract the previous time from the current time
        var deltaTime = time - this.then;
        // Remember the current time for the next frame.
        this.then = time;

        webglUtils.resizeCanvasToDisplaySize(this.gl.canvas);

        // Tell WebGL how to convert from clip space to pixels
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

        this.gl.enable(this.gl.CULL_FACE);
        this.gl.enable(this.gl.DEPTH_TEST);

        // Clear the canvas AND the depth buffer.
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // Tell it to use our program (pair of shaders)
        this.gl.useProgram(this.skyboxProgram);

        // Turn on the position attribute
        this.gl.enableVertexAttribArray(this.posLocation);

        // Bind the position buffer.
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.posBuffer);

        // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        var size = 2;          // 2 components per iteration
        var type = this.gl.FLOAT;   // the data is 32bit floats
        var normalize = false; // don't normalize the data
        var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0;        // start at the beginning of the buffer
        this.gl.vertexAttribPointer(this.posLocation, size, type, normalize, stride, offset);

        // Compute the projection matrix
        var aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
        var projectionMatrix = m4.perspective(this.fieldOfViewRadians, aspect, 1, 2000);

        // camera going in circle 2 units from origin looking at origin
        var cameraPosition = [Math.cos(time * .1), 0, Math.sin(time * .1)];
        // var cameraPosition = [0, 0, 0];
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

        if (document.getElementById('showSkybox').checked) {
            // Draw the geometry.
            this.gl.drawArrays(this.gl.TRIANGLES, 0, 1 * 6);
        }

        requestAnimationFrame(this.drawScene.bind(this));
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
                url: 'img/skybox/green.png',
            },
            {
                target: this.gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
                url: 'img/skybox/green.png',
            },
            {
                target: this.gl.TEXTURE_CUBE_MAP_POSITIVE_X,
                url: 'img/skybox/green.png',
            },
            {
                target: this.gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
                url: 'img/skybox/green.png',
            },
            {
                target: this.gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
                url: 'img/skybox/green.png',
            },
            {
                target: this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
                url: 'img/skybox/green.png',
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

}