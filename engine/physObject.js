import {PlayerController} from "./playerController.js";
import {ShadersManager as shadersManager, ShadersManager} from "./shadersManager.js";

/*
    The PhysObject class is the abstraction that joins meshes with physics and user interaction, and also
    handles rendering for the object itself.
 */

let actualPosY = null
let bounceCollision = false
let rotation = [shadersManager.degToRad(40), shadersManager.degToRad(25), shadersManager.degToRad(325)];

export class PhysObject {
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
            console.log(this)
            this.playerController = new PlayerController(this)
        }

        // What kind of collider does this object have?
        this.collider_type = collider_type

        this.dim = dim;

        this.bounds = bounds;

        // Speed, positions etc.
        this.offsets = coords
        this.position = {x: coords.x, y: coords.y, z: coords.z}
        this.positions = this.mesh.positions
        this.speed = {x: 0.0, y: 0, z: 0};

        this.accel = {x: 0.0, y: 0.0, z: 0.0};
        this.translation = {x: 0, y: 0, z: 0}


        // this.rotation = {x: 0, y: 0}
        //
        // this.level_over = false;

        // let cameraPosition = [50, -60, 60]; // eye
        // let cameraTar = [0, 2, 0]
        // let cameraUp = [0, 0, 1]; // View-Up vector
        // this.shadersManager = new ShadersManager(cameraPosition, cameraTar, cameraUp)
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

            // console.log(this.position)
            // console.log(check, physobjs)
            // let bounds = this.compute_bounds()
            let bounds = check.playerBound

            // if (this.isPlayer) {
            //     if (check.coll) {
            //         if (check.data.z.bottom.is_colliding && this.accel.z < 0) {
            //             this.speed.z = this.accel.z = 0;
            //         }
            //
            //         if (check.data.z.top.is_colliding && this.accel.z > 0) {
            //             this.speed.z = this.accel.z = 0;
            //         }
            //
            //         if (check.data.x.bottom.is_colliding && this.accel.x < 0) {
            //             this.speed.x = this.accel.x = 0;
            //         }
            //
            //         if (check.data.x.top.is_colliding && this.accel.x > 0) {
            //             this.speed.x = this.accel.x = 0;
            //         }
            //     }
            //
            //     this.speed.x += this.accel.x;
            //     this.speed.z += this.accel.z;
            //
            //     this.position.x = ((bounds.max.x + bounds.min.x) / 2) + this.speed.x;
            //     this.position.z = ((bounds.max.z + bounds.min.z) / 2) + this.speed.z;
            //
            //     this.translation.x += this.speed.x;
            //     this.translation.z += this.speed.z;
            //
            //     this.speed.x = this.speed.z = 0;
            //     this.accel.x = this.accel.z = 0;
            //
            // }
            // else if (this.isBall) {

            if (check.coll) {

                // console.log("collision done  ", this.playerController.getSpace())
                // if(this.playerController.getSpace()) this.playerController.setSpace(false)
                // else this.playerController.setSpace(true)

                this.playerController.setSpace(true)

                // if (this.speed.y < 0) {
                //     // this.speed.y = 0
                //
                // }

                // Se la palla sta collidendo sotto e non è ferma
                if (check.data.y.bottom.is_colliding) {
                    // console.log("y bottom")
                    actualPosY = this.position.y
                    // //// Y
                    // this.speed.y = -this.speed.y
                    //
                    // //// X
                    // this.calculateSpeeds('y', 'x', check.data.y.bottom.target_bounds, 7.5, false)
                    //
                    // //// Z
                    // this.calculateSpeeds('y', 'z', check.data.y.bottom.target_bounds, 7.5, false)
                }

                //Se la palla sta collidendo sopra e non è ferma
                if (check.data.y.top.is_colliding) {
                    // console.log("y top")
                    // //// Y
                    // // Rimando la palla verso l'alto con la stessa velocità con cui è arrivata
                    // this.speed.y = -this.speed.y
                    //
                    // //// X
                    // this.calculateSpeeds('y', 'x', check.data.y.top.target_bounds, 20, true)
                    //
                    // //// Z
                    // this.calculateSpeeds('y', 'z', check.data.y.top.target_bounds, 20, true)
                }

                // Se la palla sta collidendo sulla parete dietro e non è fermo
                if (check.data.x.top.is_colliding) {
                    // console.log("x top")
                    // //// X
                    // // Inverto la speed di x
                    // this.speed.x = -this.speed.x
                    //
                    // //// Y
                    // this.calculateSpeeds('x', 'y', check.data.x.top.target_bounds, 20, true)
                    //
                    // //// Z
                    // this.calculateSpeeds('x', 'z', check.data.x.top.target_bounds, 20, true)
                }

                // Se la palla sta collidendo sulla parete davanti e non è fermo
                if (check.data.x.bottom.is_colliding) {
                    // console.log("x bottom")
                    // //// X
                    // // Inverto la speed di x
                    // this.speed.x = -this.speed.x
                    //
                    // //// Y
                    // this.calculateSpeeds('x', 'y', check.data.x.bottom.target_bounds, 20, false)
                    //
                    // //// Z
                    // this.calculateSpeeds('x', 'z', check.data.x.bottom.target_bounds, 20, false)
                }

                // Se la palla sta collidendo sulla parete sinistra e non è ferma
                if (check.data.z.bottom.is_colliding) {
                    // console.log("z bottom")
                    // //// Z
                    // this.speed.z = -this.speed.z
                    //
                    // //// X
                    // this.calculateSpeeds('z', 'x', check.data.z.bottom.target_bounds, 20, false)
                    //
                    // //// Y
                    // this.calculateSpeeds('z', 'y', check.data.z.bottom.target_bounds, 20, false)
                }

                // Se la palla sta collidendo sulla parete destra e non è ferma
                if (check.data.z.top.is_colliding) {
                    // console.log("z top")
                    // //// Z
                    // this.speed.z = -this.speed.z
                    //
                    // //// X
                    // this.calculateSpeeds('z', 'x', check.data.z.top.target_bounds, 20, true)
                    //
                    // //// Y
                    // this.calculateSpeeds('z', 'y', check.data.z.top.target_bounds, 20, true)
                }
                // }

                // this.position.x = ((bounds.max.x + bounds.min.x) / 2) + this.speed.x;
                // this.position.y = ((bounds.max.y + bounds.min.y) / 2) + this.speed.y;
                // this.position.z = ((bounds.max.z + bounds.min.z) / 2) + this.speed.z;
                //
                // this.translation.x += this.speed.x;
                // this.translation.y += this.speed.y;
                // this.translation.z += this.speed.z;

                // console.log(this.speed.x)

            } else {
                //in aria

                if (this.speed.y > 0) {
                    if (!bounceCollision) {
                        if (this.position.y >= actualPosY + 4) {
                            this.speed.y = -0.3
                            // alert("sium")

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


                // if (this.speed.y > 0) {
                //     if (this.position.y >= actualPosY + 4) {
                //         this.speed.y = -0.3
                //     }
                // } else {
                //     this.speed.y = -0.3
                // }
            }
            //
            // this.speed.x += this.accel.x;
            // this.speed.z += this.accel.z;

            if(check.portalized) {
                console.log("ciao")
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


            // console.log(this.position)

            // console.log("-------------")
            // console.log("x: ", this.position.x)
            // console.log("y: ", this.position.y)
            // console.log("z: ", this.position.z)

            // console.log(this.speed.x, this.speed.y)

            // console.log(actualPosY, this.position.y)
            //
            // if (this.speed.y > 0){
            //     while(!check.coll){
            //
            //     }
            //     console.log(actualPosY, this.position.y)
            //     // if (actualPosY !== this.position.y && (this.position.y >= actualPosY + 0.2 && this.position.y <= actualPosY + 0.3)){
            //     //     this.speed.y = -0.1
            //     // }
            // }
        }
    }

    // calculateSpeeds(mainAxe, secondAxe, targetBounds, targetLength, plus) {
    //     let secondAxeCenterOfTarget = (targetBounds.max[secondAxe] + targetBounds.min[secondAxe]) / 2
    //     let secondAxeBallDistanceFromCenterOfTarget = Math.abs(this.position[secondAxe]) - Math.abs(secondAxeCenterOfTarget)
    //
    //     let toRemoveAtMainAxeAndGiveToSecondAxe = Math.abs(this.speed[secondAxe] / 2 * secondAxeBallDistanceFromCenterOfTarget) / Math.abs(targetLength)
    //
    //     if (plus) {
    //         this.speed[mainAxe] += toRemoveAtMainAxeAndGiveToSecondAxe
    //     } else {
    //         this.speed[mainAxe] -= toRemoveAtMainAxeAndGiveToSecondAxe
    //     }
    //
    //     if (this.speed[secondAxe] < 0) {
    //         this.speed[secondAxe] -= toRemoveAtMainAxeAndGiveToSecondAxe
    //     } else {
    //         this.speed[secondAxe] += toRemoveAtMainAxeAndGiveToSecondAxe
    //     }
    // }

    is_colliding(physobjs) {
        // Main collision check routine
        let bounds = this.compute_bounds()
        //let coll = false
        // let colliders = [];
        let coll = false
        let ramp = false;

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

                // if (physobjs[obj].name === "portal"){
                //     console.log(physobjs[obj].bounds)
                // }

                let targetBounds = physobjs[obj].bounds;
                // console.log(targetBounds)
                // if (!physobjs[obj].isPlayer) {
                //     console.log(physobjs[obj].name)
                //     targetBounds = physobjs[obj].bounds;
                // } else {
                //     console.log("ciao")
                //     targetBounds = physobjs[obj].compute_bounds()
                // }


                // Se collide da qualche parte
                if ((bounds.min.x <= targetBounds.max.x && bounds.max.x >= targetBounds.min.x) &&
                    (bounds.min.z <= targetBounds.max.z && bounds.max.z >= targetBounds.min.z) &&
                    (bounds.min.y <= targetBounds.max.y && bounds.max.y >= targetBounds.min.y)) {
                    isColliding = true;

                    if (this.speed.y < 0) {
                        this.speed.y = 0
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
                    coll = true;

                    if (physobjs[obj].collider_type === "death") {

                        console.log("over")
                        window.dispatchEvent(new CustomEvent('game_over'))

                    } else if (physobjs[obj].collider_type === "evilPortal") {
                        // come spawna la camera


                        isPortalized = true;

                        this.position.x = 0
                        this.position.y = 4.5
                        this.position.z = 0

                        // dove spawna l'oggetto
                        this.translation.x = 0;
                        this.translation.y = 0;
                        this.translation.z = 0;

                        // this.speed.x = 0.0

                        newPositions = this.position;
                        newTranslations = this.translation;

                    } else if (physobjs[obj].collider_type === "portal") {
                        isPortalized = true;

                        this.position.x = 110
                        this.position.y = 6
                        this.position.z = 0

                        this.translation.x = 110;
                        this.translation.y = 2;
                        this.translation.z = 0;

                        // this.speed.x = 0.0

                        newPositions = this.position;
                        newTranslations = this.translation;
                        //
                        // this.position.x = 0;
                        // this.position.y = 4.5;
                        // this.position.z = 0;
                        //
                        // this.translation.x = 0;
                        // this.translation.y = 0;
                        // this.translation.z = 0;

                    } else if (physobjs[obj].collider_type === "coin") {
                        // delete coin
                        physobjs[obj].translation.y = -9999
                        window.dispatchEvent(new CustomEvent('point'))

                    } else if (physobjs[obj].collider_type === "bounce") {
                        this.speed.y = 0.4
                        bounceCollision = true
                    }else if (physobjs[obj].collider_type === "win") {
                        console.log("win")
                        window.dispatchEvent(new CustomEvent('win'))                    }
                }
            }

            // if (physobjs[obj].collider_type === "box") {
            //     if (physobjs[obj].position.y <= this.position.y) {
            //         data.y.bottom = true;
            //     }
            //     if (physobjs[obj].position.y > this.position.y) {
            //         data.y.top = true;
            //     }
            //     if (physobjs[obj].bounds.max.y > this.position.y) {
            //         data.x.top = data.x.bottom = data.z.top = data.z.bottom = true;
            //         data.y.top = data.y.bottom = false;
            //     }
            // } else {
            //     data.y.bottom = true;
            // }
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