export class ShadersManager {

    static vertexShaderParameters = {
        // cameraPosition: [75, 5, 7],
        cameraPosition: [56, -40, 26],
        cameraTar: [0, 0, 20],
        cameraUp: [0, 0, 1],
        fieldOfViewDegrees: 15,
        zNear: 1,
        zFar: 2000
    }

    static fragmentShaderParameters = {
        lightDirection: [355, -195, 360],
        ambientLight: [0.2, 0.2, 0.2],
        colorLight: [1.0, 1.0, 1.0],
        shininess: 359.999993,
        opacity: 1.45,
        textureLocation: 0,
        diffuse: [0.8, 0.8, 0.8],
        ambient: [1, 1, 1],
        specular: [0.5, 0.5, 0.5],
        emissive: [0, 0, 0]
    }

    // Vertex Shader parameters

    static getCameraPosition(player_coords) {
        // console.log(player_coords)
        return [this.vertexShaderParameters.cameraPosition[0] + player_coords[0], this.vertexShaderParameters.cameraPosition[1] + player_coords[1],
            this.vertexShaderParameters.cameraPosition[2] + player_coords[2]];
    }

    static increaseFieldOfViewRadiansOf(value) {
        if (this.vertexShaderParameters.fieldOfViewDegrees < 20) {
            this.vertexShaderParameters.fieldOfViewDegrees += value;
        }
    }

    static decreaseFieldOfViewRadiansOf(value) {
        if (this.vertexShaderParameters.fieldOfViewDegrees > 13) {
            this.vertexShaderParameters.fieldOfViewDegrees -= value;
        }
    }

    static increaseCameraPositionAtIndexOfValue(index, value) {
        if (this.vertexShaderParameters.cameraPosition[index] < 75) {
            this.vertexShaderParameters.cameraPosition[index] += value;
        }
    }

    static decreaseCameraPositionAtIndexOfValue(index, value) {
        if (this.vertexShaderParameters.cameraPosition[index] > -60) {
            this.vertexShaderParameters.cameraPosition[index] -= value;
        }
    }

    static getCameraTar() {
        return this.vertexShaderParameters.cameraTar;
    }

    static getCameraUp() {
        return this.vertexShaderParameters.cameraUp;
    }

    // View Matrix è l'inversa della Camera Matrix
    // Ed è il nuovo sistema di riferimento
    static getViewMatrix(camera_positions, player_coords) {
        // cameraUp: View-Up vector
        // cameraMatrix: posizione e orientamento della camera nel mondo
        let cameraMatrix = m4.lookAt(camera_positions, player_coords, this.vertexShaderParameters.cameraUp);
        // inverse: sposta tutto il resto in modo tale che la camera sia all'origine
        return m4.inverse(cameraMatrix)
    }

    static getProjectionMatrix(canvasClientWidth, canvasClientHeight) {
        let aspect = canvasClientWidth / canvasClientHeight;

        // zNear: near Z clipping plane
        // zFar: far Z clipping plane
        return m4.perspective(this.degToRad(this.vertexShaderParameters.fieldOfViewDegrees), aspect,
            this.vertexShaderParameters.zNear, this.vertexShaderParameters.zFar);
    }

    static getLightDirection() {
        return m4.normalize(this.fragmentShaderParameters.lightDirection)
    }

    static degToRad(d) {
        return d * Math.PI / 180;
    }

    static generateGuiControls() {
        let shadersControls = new dat.GUI({
            autoPlace: false,
            width: 250
        });

        let camera = shadersControls.addFolder('Camera');

        let camera_position = camera.addFolder('Position');
        camera_position.add(this.vertexShaderParameters.cameraPosition, 0).min(-60).max(60).step(1);
        camera_position.add(this.vertexShaderParameters.cameraPosition, 1).min(-75).max(15).step(1);
        camera_position.add(this.vertexShaderParameters.cameraPosition, 2).min(-200).max(200).step(1)

        camera.add(this.vertexShaderParameters, "fieldOfViewDegrees").min(13).max(20).step(1)

        let lights = shadersControls.addFolder('Lights');
        lights.add(this.fragmentShaderParameters.lightDirection, 0).min(-360).max(360).step(1);
        lights.add(this.fragmentShaderParameters.lightDirection, 1).min(-360).max(360).step(1);
        lights.add(this.fragmentShaderParameters.lightDirection, 2).min(-360).max(360).step(1);

        return shadersControls;
    }

    // Fragment Shader parameters
    static getAmbientLight() {
        return this.fragmentShaderParameters.ambientLight;
    }

    // Fragment Shader parameters
    static getColorLight() {
        return this.fragmentShaderParameters.colorLight;
    }

    static getShininess() {
        return this.fragmentShaderParameters.shininess
    }

    static getOpacity() {
        return this.fragmentShaderParameters.opacity
    }

    static getTextureLocation() {
        return this.fragmentShaderParameters.textureLocation
    }

    static getDiffuse() {
        return this.fragmentShaderParameters.diffuse
    }

    static getAmbient() {
        return this.fragmentShaderParameters.ambient
    }

    static getSpecular() {
        return this.fragmentShaderParameters.specular
    }

    static getEmissive() {
        return this.fragmentShaderParameters.emissive
    }
}