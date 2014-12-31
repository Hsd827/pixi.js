var BaseTexture = require('./BaseTexture'),
    utils = require('../utils');

/**
 * A texture of a [playing] Video.
 *
 * See the ["deus" demo](http://www.goodboydigital.com/pixijs/examples/deus/).
 *
 * @class
 * @extends BaseTexture
 * @namespace PIXI
 * @param source {HTMLVideoElement}
 * @param [scaleMode] {number} See {@link scaleModes} for possible values
 */
function VideoBaseTexture(source, scaleMode) {
    if (!source){
        throw new Error('No video source element specified.');
    }

    // hook in here to check if video is already available.
    // BaseTexture looks for a source.complete boolean, plus width & height.

    if ((source.readyState === source.HAVE_ENOUGH_DATA || source.readyState === source.HAVE_FUTURE_DATA) && source.width && source.height) {
        source.complete = true;
    }

    BaseTexture.call(this, source, scaleMode);

    this.autoUpdate = false;

    this._boundOnUpdate = this._onUpdate.bind(this);
    this._boundOnCanPlay = this._onCanPlay.bind(this);

    if (!source.complete) {
        source.addEventListener('canplay', this._boundOnCanPlay);
        source.addEventListener('canplaythrough', this._boundOnCanPlay);

        // started playing..
        source.addEventListener('play', this._onPlayStart.bind(this));
        source.addEventListener('pause', this._onPlayStop.bind(this));
    }
}

VideoBaseTexture.prototype = Object.create(BaseTexture.prototype);
VideoBaseTexture.prototype.constructor = VideoBaseTexture;
module.exports = VideoBaseTexture;

VideoBaseTexture.prototype._onUpdate = function () {
    if (this.autoUpdate) {
        window.requestAnimationFrame(this._boundOnUpdate);
        this.needsUpdate = true;
    }
};

VideoBaseTexture.prototype._onPlayStart = function () {
    if (!this.autoUpdate) {
        window.requestAnimationFrame(this._boundOnUpdate);
        this.autoUpdate = true;
    }
};

VideoBaseTexture.prototype._onPlayStop = function () {
    this.autoUpdate = false;
};

VideoBaseTexture.prototype._onCanPlay = function () {
    if (event.type === 'canplaythrough') {
        this.hasLoaded  = true;


        if (this.source) {
            this.source.removeEventListener('canplay', this._boundOnCanPlay);
            this.source.removeEventListener('canplaythrough', this._boundOnCanPlay);

            this.width = this.source.videoWidth;
            this.height = this.source.videoHeight;

            // prevent multiple loaded dispatches..
            if (!this.__loaded){
                this.__loaded = true;
                this.dispatchEvent({ type: 'loaded', content: this });
            }
        }
    }
};

VideoBaseTexture.prototype.destroy = function () {
    if (this.source && this.source._pixiId) {
        utils.BaseTextureCache[ this.source._pixiId ] = null;
        delete utils.BaseTextureCache[ this.source._pixiId ];

        this.source._pixiId = null;
        delete this.source._pixiId;
    }

    BaseTexture.prototype.destroy.call(this);
};

/**
 * Mimic Pixi BaseTexture.from.... method.
 *
 * @static
 * @param video {HTMLVideoElement}
 * @param scaleMode {number} See {@link scaleModes} for possible values
 * @return {VideoBaseTexture}
 */
VideoBaseTexture.fromVideo = function (video, scaleMode) {
    if (!video._pixiId) {
        video._pixiId = 'video_' + utils.uuid();
    }

    var baseTexture = utils.BaseTextureCache[video._pixiId];

    if (!baseTexture) {
        baseTexture = new VideoBaseTexture(video, scaleMode);
        utils.BaseTextureCache[ video._pixiId ] = baseTexture;
    }

    return baseTexture;
};

/**
 * Mimic Pixi BaseTexture.from.... method.
 *
 * @static
 * @param videoSrc {string} The URL for the video.
 * @param scaleMode {number} See {@link scaleModes} for possible values
 * @return {VideoBaseTexture}
 */
VideoBaseTexture.fromUrl = function (videoSrc, scaleMode) {
    var video = document.createElement('video');

    video.src = videoSrc;
    video.autoPlay = true;
    video.play();

    return VideoBaseTexture.textureFromVideo(video, scaleMode);
};