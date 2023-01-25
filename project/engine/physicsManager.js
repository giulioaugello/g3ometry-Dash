import {Inputs} from "./inputs.js";
import {ShadersManager as shadersManager, ShadersManager} from "./shadersManager.js";

/*
    The PhysicsManager class is the abstraction that joins meshes with physics and user interaction, and also
    handles rendering for the object itself.
 */

let actualPosY = null
let bounceCollision = false
let rotation = [shadersManager.degToRad(40), shadersManager.degToRad(25), shadersManager.degToRad(325)];

export class PhysicsManager {
    // offsets sono le coordinate degli oggetti che mettiamo nelle scene
    constructor(mesh, name, isPlayer, isDuplicated, collider_type, dim, coords, bounds) {
        // Save mesh data
        this.mesh = mesh;

        // Set the alias, an ideally unique name.
        this.name = name;

        this.isDuplicated = isDuplicated;

        // Is this a player-controllable object (an actor)?
        this.isPlayer = isPlayer;

        if (this.isPlayer) {
            // If object is player-controllable, a controller is created.
            this.playerController = new Inputs(this)
        }

        // What kind of collider does this object have?
        this.collider_type = collider_type

        this.dim = dim;

        this.bounds = bounds;

        // Speed, positions etc.
        this.position = {x: coords.x, y: coords.y, z: coords.z}
        this.positions = this.mesh.positions
        this.translation = {x: 0, y: 0, z: 0}

        this.speed = {x: 0.0, y: 0, z: 0};

    }

    /*
    il campo "coords" nei file json serve per posizione camera, bound oggetto e colliding oggetto. La posizione visuale dell'oggetto
    dipende dalla posizione su blender. Quindi in "coords" bisogna mettere come coordinate quelle di blender, altrimenti le coordinate
    della bounding box non sono uguali a quelle reali dell'oggetto.
     */

    compute_phys(physobjs) {
        // Compute phys routine. If object is active, it checks for collisions and applies the correct forces to it.
        if (this.isPlayer) {
            let check = this.is_colliding(physobjs)
            let bounds = check.playerBound

            if (check.coll) {
                this.playerController.setSpace(true)

                // Se la palla sta collidendo sotto e non è ferma
                if (check.data.y.bottom.is_colliding) {
                    actualPosY = this.position.y
                    if (this.speed.y < 0) {
                        this.speed.y = 0
                    }

                }

                //Se la palla sta collidendo sopra e non è ferma
                if (check.data.y.top.is_colliding) {

                }


                if (check.data.x.top.is_colliding && this.speed.x > 0) {
                    console.log("x top")
                    // this.playerController.setSpace(false)
                    this.playerController.stopSpace()
                    this.speed.x = 0

                    // this.speed.y = -0.15
                }

                if (check.data.x.bottom.is_colliding) {
                    // console.log("x bottom")
                    // this.speed.x = 0
                }

                if (check.data.z.bottom.is_colliding) {
                    // console.log("z bottom")
                    // this.speed.z = 0

                }

                if (check.data.z.top.is_colliding) {
                    // console.log("z top")
                    // this.speed.z = 0
                }


            } else {
                //in aria

                if (this.speed.y > 0) {
                    if (!bounceCollision) {

                        if (this.position.y >= actualPosY + 4) {
                            this.speed.y = -0.3
                        }

                    } else {

                        if (this.position.y >= actualPosY + 8) {
                            this.speed.y = -0.3
                        }

                    }
                } else {
                    this.speed.y = -0.3
                    bounceCollision = false
                }

                this.playerController.setSpace(false)
            }

            if (check.portalized) {

                this.position = check.newPositions;
                this.translation = check.newTranslations;

            } else {

                this.position.x = ((bounds.max.x + bounds.min.x) / 2) + this.speed.x;
                this.position.y = ((bounds.max.y + bounds.min.y) / 2) + this.speed.y;
                this.position.z = ((bounds.max.z + bounds.min.z) / 2) + this.speed.z;

                this.translation.x += this.speed.x;
                this.translation.y += this.speed.y;
                this.translation.z += this.speed.z;

            }
        }
    }

    is_colliding(physobjs) {
        // Main collision check routine
        let bounds = this.compute_bounds()

        let isColliding = false;
        let isPortalized = false;
        let newPositions = null;
        let newTranslations = null;

        let data = {
            x: {
                top: {
                    is_colliding: false,
                    bounds: null,
                    target_bounds: null
                },
                bottom: {
                    is_colliding: false,
                    bounds: null,
                    target_bounds: null
                }
            },
            y: {
                top: {
                    is_colliding: false,
                    bounds: null,
                    target_bounds: null
                },
                bottom: {
                    is_colliding: false,
                    bounds: null,
                    target_bounds: null
                }
            }, z: {
                top: {
                    is_colliding: false,
                    bounds: null,
                    target_bounds: null
                },
                bottom: {
                    is_colliding: false,
                    bounds: null,
                    target_bounds: null
                }
            }
        }

        for (const obj in physobjs) {

            if (this.isPlayer && !physobjs[obj].isPlayer) {
                let targetBounds = physobjs[obj].bounds;

                // Se collide da qualche parte
                if ((bounds.min.x <= targetBounds.max.x && bounds.max.x >= targetBounds.min.x) &&
                    (bounds.min.z <= targetBounds.max.z && bounds.max.z >= targetBounds.min.z) &&
                    (bounds.min.y <= targetBounds.max.y && bounds.max.y >= targetBounds.min.y)) {

                    if (physobjs[obj].collider_type === "death") {
                        console.log("death")
                        window.dispatchEvent(new CustomEvent('game_over'))
                    } else if (physobjs[obj].collider_type === "evilPortal") {
                        window.dispatchEvent(new CustomEvent('game_over'))

                        // isPortalized = true;
                        //
                        // this.position.x = -4
                        // this.position.y = 4.5
                        // this.position.z = 0
                        //
                        // this.translation.x = 95;
                        // this.translation.y = 0;
                        // this.translation.z = 0;
                        //
                        // newPositions = this.position;
                        // newTranslations = this.translation;
                    } else if (physobjs[obj].collider_type === "portal") {
                        isPortalized = true;

                        this.position.x = 114
                        this.position.y = 6
                        this.position.z = 0

                        this.translation.x = 114;
                        this.translation.y = 2;
                        this.translation.z = 0;

                        newPositions = this.position;
                        newTranslations = this.translation;
                    } else if (physobjs[obj].collider_type === "coin") {
                        physobjs[obj].collider_type = "box"
                        physobjs[obj].translation.y = -9999
                        physobjs[obj].position.y = -9999
                        physobjs[obj].bounds = {
                            max: {
                                x: -9999,
                                y: -9999,
                                z: -9999
                            }, min: {
                                x: -9999,
                                y: -9999,
                                z: -9999
                            }
                        }

                        window.dispatchEvent(new CustomEvent('point'))
                    } else if (physobjs[obj].collider_type === "bounce") {
                        this.speed.y = 0.4
                        bounceCollision = true
                    } else if (physobjs[obj].collider_type === "win") {
                        console.log("win event")
                        window.dispatchEvent(new CustomEvent('win'))
                    }

                    switch (this.whereIsColliding(bounds, targetBounds)) {
                        case 0:
                            data.z.bottom.is_colliding = true
                            data.z.bottom.bounds = bounds
                            data.z.bottom.target_bounds = targetBounds
                            break
                        case 1:
                            data.z.top.is_colliding = true
                            data.z.top.bounds = bounds
                            data.z.top.target_bounds = targetBounds
                            break
                        case 2:
                            data.y.bottom.is_colliding = true
                            data.y.bottom.bounds = bounds
                            data.y.bottom.target_bounds = targetBounds
                            break
                        case 3:
                            data.y.top.is_colliding = true
                            data.y.top.bounds = bounds
                            data.y.top.target_bounds = targetBounds
                            break
                        case 4:
                            data.x.bottom.is_colliding = true
                            data.x.bottom.bounds = bounds
                            data.x.bottom.target_bounds = targetBounds
                            break
                        case 5:
                            data.x.top.is_colliding = true
                            data.x.top.bounds = bounds
                            data.x.top.target_bounds = targetBounds
                            break

                    }
                    isColliding = true;
                }
            }
        }
        return {
            'portalized': isPortalized,
            'newPositions': newPositions,
            'newTranslations': newTranslations,
            'playerBound': bounds,
            'coll': isColliding,
            'data': data
        };
    }

    whereIsColliding(bounds, targetBounds) {
        let zBottomDifference = Math.abs(bounds.min.z - targetBounds.max.z)
        let zTopDifference = Math.abs(targetBounds.min.z - bounds.max.z)
        let yBottomDifference = Math.abs(bounds.min.y - targetBounds.max.y)
        let yTopDifference = Math.abs(targetBounds.min.y - bounds.max.y)
        let xTopDifference = Math.abs(bounds.min.x - targetBounds.max.x)
        let xBottomDifference = Math.abs(targetBounds.min.x - bounds.max.x)

        let differences = [zBottomDifference, zTopDifference, yBottomDifference, yTopDifference, xTopDifference, xBottomDifference]

        return differences.indexOf(Math.min(...differences))
    }


    compute_bounds() {
        return {
            max: {
                x: this.position.x + (this.dim.x / 2),
                y: this.position.y + (this.dim.y / 2),
                z: this.position.z + (this.dim.z / 2)
            }, min: {
                x: this.position.x - (this.dim.x / 2),
                y: this.position.y - (this.dim.y / 2),
                z: this.position.z - (this.dim.z / 2)
            }
        }
    }

    render(gl, program, player_coords) {
        if (!this.isDuplicated) {
            gl.useProgram(program);

            const size = 3;
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;

            // Binds and creates the position buffer for this object.
            this.positionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.mesh.positions), gl.STATIC_DRAW);
            let positionLocation = gl.getAttribLocation(program, "a_position");
            gl.enableVertexAttribArray(positionLocation);
            gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);

            // Binds and creates the normals buffer for this object.
            this.normalsBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.mesh.normals), gl.STATIC_DRAW);
            let normalLocation = gl.getAttribLocation(program, "a_normal");
            gl.enableVertexAttribArray(normalLocation);
            gl.vertexAttribPointer(normalLocation, size, type, normalize, stride, offset);

            // Binds and creates the texture coordinates buffer for this object.
            this.texcoordBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.mesh.text_coords), gl.STATIC_DRAW);
            let texcoordLocation = gl.getAttribLocation(program, "a_texcoord");
            gl.enableVertexAttribArray(texcoordLocation);
            gl.vertexAttribPointer(texcoordLocation, size - 1, type, normalize, stride, offset);

            // Set up translation vector (u_translation)
            let translation = gl.getUniformLocation(program, "u_translation")
            gl.uniform3fv(translation, [this.translation.z, this.translation.x, this.translation.y])

            let rotationMatrix = gl.getUniformLocation(program, 'u_normalMatrix')
            gl.uniformMatrix4fv(rotationMatrix, false, m4.identity())

            // // Set up the projection matrix (u_projection)
            let projectionMatrixLocation = gl.getUniformLocation(program, "u_projection_matrix");
            gl.uniformMatrix4fv(projectionMatrixLocation, false, ShadersManager.getProjectionMatrix(gl.canvas.clientWidth, gl.canvas.clientHeight));

            let camera_positions = ShadersManager.getCameraPosition(player_coords)
            // Set up viewWorldPositionLocation (u_viewWorldPosition)
            let viewWorldPositionLocation = gl.getUniformLocation(program, "u_viewWorldPosition");
            gl.uniform3fv(viewWorldPositionLocation, camera_positions);

            // Set up viewMatrixLocation (u_view)
            let viewMatrixLocation = gl.getUniformLocation(program, "u_view_matrix");
            gl.uniformMatrix4fv(viewMatrixLocation, false, ShadersManager.getViewMatrix(camera_positions, player_coords));

            // Fragment Shader

            // Set up lightWorldDirectionLocation (u_lightDirection)
            let lightWorldDirectionLocation = gl.getUniformLocation(program, "u_lightDirection");
            gl.uniform3fv(lightWorldDirectionLocation, ShadersManager.getLightDirection());

            // Set up the diffuse of the object. If none are found, default values are loaded.
            let diffuse = gl.getUniformLocation(program, "diffuse")
            gl.uniform3fv(diffuse, (this.mesh.diffuse ? this.mesh.diffuse : ShadersManager.getDiffuse()));

            // Set up the ambient of the object. If none are found, default values are loaded.
            let ambient = gl.getUniformLocation(program, "ambient")
            gl.uniform3fv(ambient, (this.mesh.ambient ? this.mesh.ambient : ShadersManager.getAmbient()));

            // Set up the specular of the object. If none are found, default values are loaded.
            let specular = gl.getUniformLocation(program, "specular")
            gl.uniform3fv(specular, (this.mesh.specular ? this.mesh.specular : ShadersManager.getSpecular()));

            // Set up the emissive of the object. If none are found, default values are loaded.
            let emissive = gl.getUniformLocation(program, "emissive")
            gl.uniform3fv(emissive, (this.mesh.emissive ? this.mesh.emissive : ShadersManager.getEmissive()));

            // Set up the u_ambientLight of the object. If none are found, default values are loaded.
            let u_ambientLight = gl.getUniformLocation(program, "u_ambientLight")
            gl.uniform3fv(u_ambientLight, ShadersManager.getAmbientLight());

            // Set up the u_colorLight of the object. If none are found, default values are loaded.
            let u_colorLight = gl.getUniformLocation(program, "u_colorLight")
            gl.uniform3fv(u_colorLight, ShadersManager.getColorLight());

            // Set up the shininess of the object. If none are found, default values are loaded.
            let shininess = gl.getUniformLocation(program, "shininess")
            gl.uniform1f(shininess, (this.mesh.shininess ? this.mesh.shininess : ShadersManager.getShininess()));

            // Set up the opacity of the object. If none are found, default values are loaded.
            let opacity = gl.getUniformLocation(program, "opacity")
            gl.uniform1f(opacity, (this.mesh.opacity ? this.mesh.opacity : ShadersManager.getOpacity()));

            // Set up textureLocation (diffuseMap). Tell the shader to use texture unit 0 for diffuseMap
            let textureLocation = gl.getUniformLocation(program, "diffuseMap");
            gl.uniform1i(textureLocation, ShadersManager.getTextureLocation());

            //drawScene(this.mesh, this.screen, mirrorText, this.mesh.numVertices)
            drawScene(this.mesh, this.mesh.numVertices)

            function drawScene(mesh, vertNumber) {
                // // Draw the scene, using textures and binding them when's appropriate.
                gl.bindTexture(gl.TEXTURE_2D, mesh.texture);
                gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
                gl.enable(gl.DEPTH_TEST);

                // Set up matrixLocation (u_world)
                let matrix = m4.identity();
                let matrixLocation = gl.getUniformLocation(program, "u_world");
                gl.uniformMatrix4fv(matrixLocation, false, matrix);

                // Draw arrays contents on the canvas.
                gl.drawArrays(gl.TRIANGLES, 0, vertNumber);
            }
        }
    }
}