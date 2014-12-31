var Shader = require('./Shader');

/**
 * @class
 * @extends Shader
 * @namespace PIXI
 * @param gl {WebGLContext} the current WebGL drawing context
 */
function PixiFastShader(gl) {
    Shader.call(this,
        gl,
        // vertex shader
        null,
        // fragment shader
        [
            'attribute vec2 aVertexPosition;',
            'attribute vec2 aPositionCoord;',
            'attribute vec2 aScale;',
            'attribute float aRotation;',
            'attribute vec2 aTextureCoord;',
            'attribute float aColor;',

            'uniform vec2 projectionVector;',
            'uniform vec2 offsetVector;',
            'uniform mat3 uMatrix;',

            'varying vec2 vTextureCoord;',
            'varying float vColor;',

            'const vec2 center = vec2(-1.0, 1.0);',

            'void main(void) {',
            '   vec2 v;',
            '   vec2 sv = aVertexPosition * aScale;',
            '   v.x = (sv.x) * cos(aRotation) - (sv.y) * sin(aRotation);',
            '   v.y = (sv.x) * sin(aRotation) + (sv.y) * cos(aRotation);',
            '   v = ( uMatrix * vec3(v + aPositionCoord , 1.0) ).xy ;',
            '   gl_Position = vec4( ( v / projectionVector) + center , 0.0, 1.0);',
            '   vTextureCoord = aTextureCoord;',
          //  '   vec3 color = mod(vec3(aColor.y/65536.0, aColor.y/256.0, aColor.y), 256.0) / 256.0;',
            '   vColor = aColor;',
            '}'
        ].join('\n'),
        // custom uniforms
        {
            uMatrix: { type: 'mat3', value: new Float32Array(9) }
        },
        // custom attributes
        {
            aPositionCoord: 0,
            aRotation:      0,
            aScale:         0
        }
    );
}

PixiFastShader.prototype = Object.create(Shader.prototype);
PixiFastShader.prototype.constructor = PixiFastShader;
module.exports = PixiFastShader;