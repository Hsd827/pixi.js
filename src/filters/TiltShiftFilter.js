var AbstractFilter = require('./AbstractFilter'),
    TiltShiftXFilter = require('./TiltShiftXFilter'),
    TiltShiftYFilter = require('./TiltShiftYFilter');

/**
 * @author Vico @vicocotea
 * original filter https://github.com/evanw/glfx.js/blob/master/src/filters/blur/tiltshift.js by Evan Wallace : http://madebyevan.com/
 */

/**
 * A TiltShift Filter. Manages the pass of both a TiltShiftXFilter and TiltShiftYFilter.
 *
 * @class
 * @extends AbstractFilter
 * @namespace PIXI
 */
TiltShiftFilter = function () {
    AbstractFilter.call(this);

    this.tiltShiftXFilter = new TiltShiftXFilter();
    this.tiltShiftYFilter = new TiltShiftYFilter();

    this.tiltShiftXFilter.updateDelta();
    this.tiltShiftXFilter.updateDelta();

    this.passes = [this.tiltShiftXFilter, this.tiltShiftYFilter];
};

TiltShiftFilter.prototype = Object.create(AbstractFilter.prototype);
TiltShiftFilter.prototype.constructor = TiltShiftFilter;
module.exports = TiltShiftFilter;

Object.defineProperties(TiltShiftFilter.prototype, {
    /**
     * The strength of the blur.
     *
     * @member {number}
     * @memberof TiltShiftFilter#
     */
    blur: {
        get: function () {
            return this.tiltShiftXFilter.blur;
        },
        set: function (value) {
            this.tiltShiftXFilter.blur = this.tiltShiftYFilter.blur = value;
        }
    },

    /**
     * The strength of the gradient blur.
     *
     * @member {number}
     * @memberof TiltShiftFilter#
     */
    gradientBlur: {
        get: function () {
            return this.tiltShiftXFilter.gradientBlur;
        },
        set: function (value) {
            this.tiltShiftXFilter.gradientBlur = this.tiltShiftYFilter.gradientBlur = value;
        }
    },

    /**
     * The Y value to start the effect at.
     *
     * @member {number}
     * @memberof TiltShiftFilter#
     */
    start: {
        get: function () {
            return this.tiltShiftXFilter.start;
        },
        set: function (value) {
            this.tiltShiftXFilter.start = this.tiltShiftYFilter.start = value;
        }
    },

    /**
     * The Y value to end the effect at.
     *
     * @member {number}
     * @memberof TiltShiftFilter#
     */
    end: {
        get: function () {
            return this.tiltShiftXFilter.end;
        },
        set: function (value) {
            this.tiltShiftXFilter.end = this.tiltShiftYFilter.end = value;
        }
    },
});