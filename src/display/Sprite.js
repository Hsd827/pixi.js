var math = require('../math'),
    Texture = require('../textures/Texture'),
    DisplayObjectContainer = require('./DisplayObjectContainer');

/**
 * The Sprite object is the base for all textured objects that are rendered to the screen
 *
 * A sprite can be created directly from an image like this:
 *
 * ```js
 * var sprite = new Sprite.fromImage('assets/image.png');
 * yourStage.addChild(sprite);
 * ```
 *
 * then obviously don't forget to add it to the stage you have already created
 *
 * @class Sprite
 * @extends DisplayObjectContainer
 * @namespace PIXI
 * @param texture {Texture} The texture for this sprite
 */
function Sprite(texture) {
    DisplayObjectContainer.call(this);

    /**
     * The anchor sets the origin point of the texture.
     * The default is 0,0 this means the texture's origin is the top left
     * Setting than anchor to 0.5,0.5 means the textures origin is centered
     * Setting the anchor to 1,1 would mean the textures origin points will be the bottom right corner
     *
     * @member {Point}
     */
    this.anchor = new math.Point();

    /**
     * The texture that the sprite is using
     *
     * @member {Texture}
     */
    this.texture = texture || Texture.EMPTY;

    /**
     * The width of the sprite (this is initially set by the texture)
     *
     * @member {number}
     * @private
     */
    this._width = 0;

    /**
     * The height of the sprite (this is initially set by the texture)
     *
     * @member {number}
     * @private
     */
    this._height = 0;

    /**
     * The tint applied to the sprite. This is a hex value. A value of 0xFFFFFF will remove any tint effect.
     *
     * @member {number}
     * @default 0xFFFFFF
     */
    this.tint = 0xFFFFFF;

    /**
     * The blend mode to be applied to the sprite. Set to PIXI.blendModes.NORMAL to remove any blend mode.
     *
     * @member {number}
     * @default PIXI.blendModes.NORMAL;
     */
    this.blendMode = PIXI.blendModes.NORMAL;

    /**
     * The shader that will be used to render the texture to the stage. Set to null to remove a current shader.
     *
     * @member {AbstractFilter}
     */
    this.shader = null;

    // wait for the texture to load
    if (this.texture.baseTexture.hasLoaded) {
        this.onTextureUpdate();
    }
    else {
        this.texture.on('update', this.onTextureUpdate.bind(this));
    }

    this.renderable = true;
}

// constructor
Sprite.prototype = Object.create(DisplayObjectContainer.prototype);
Sprite.prototype.constructor = Sprite;
module.exports = Sprite;

Object.defineProperties(Sprite.prototype, {
    /**
     * The width of the sprite, setting this will actually modify the scale to achieve the value set
     *
     * @member
     * @memberof Sprite#
     */
    width: {
        get: function () {
            return this.scale.x * this.texture.frame.width;
        },
        set: function (value) {
            this.scale.x = value / this.texture.frame.width;
            this._width = value;
        }
    },

    /**
     * The height of the sprite, setting this will actually modify the scale to achieve the value set
     *
     * @member
     * @memberof Sprite#
     */
    height: {
        get: function () {
            return  this.scale.y * this.texture.frame.height;
        },
        set: function (value) {
            this.scale.y = value / this.texture.frame.height;
            this._height = value;
        }
    }
});

/**
 * Sets the texture of the sprite
 *
 * @param texture {Texture} The PIXI texture that is displayed by the sprite
 */
Sprite.prototype.setTexture = function (texture) {
    this.texture = texture;
    this.cachedTint = 0xFFFFFF;
};

/**
 * When the texture is updated, this event will fire to update the scale and frame
 *
 * @private
 */
Sprite.prototype.onTextureUpdate = function () {
    // so if _width is 0 then width was not set..
    if (this._width) {
        this.scale.x = this._width / this.texture.frame.width;
    }

    if (this._height) {
        this.scale.y = this._height / this.texture.frame.height;
    }
};

/**
 * Returns the bounds of the Sprite as a rectangle. The bounds calculation takes the worldTransform into account.
 *
 * @param matrix {Matrix} the transformation matrix of the sprite
 * @return {Rectangle} the framing rectangle
 */
Sprite.prototype.getBounds = function (matrix) {
    var width = this.texture.frame.width;
    var height = this.texture.frame.height;

    var w0 = width * (1-this.anchor.x);
    var w1 = width * -this.anchor.x;

    var h0 = height * (1-this.anchor.y);
    var h1 = height * -this.anchor.y;

    var worldTransform = matrix || this.worldTransform ;

    var a = worldTransform.a;
    var b = worldTransform.b;
    var c = worldTransform.c;
    var d = worldTransform.d;
    var tx = worldTransform.tx;
    var ty = worldTransform.ty;

    var maxX = -Infinity;
    var maxY = -Infinity;

    var minX = Infinity;
    var minY = Infinity;

    if(b === 0 && c === 0)
    {
        // scale may be negative!
        if(a < 0)a *= -1;
        if(d < 0)d *= -1;

        // this means there is no rotation going on right? RIGHT?
        // if thats the case then we can avoid checking the bound values! yay
        minX = a * w1 + tx;
        maxX = a * w0 + tx;
        minY = d * h1 + ty;
        maxY = d * h0 + ty;
    }
    else
    {
        var x1 = a * w1 + c * h1 + tx;
        var y1 = d * h1 + b * w1 + ty;

        var x2 = a * w0 + c * h1 + tx;
        var y2 = d * h1 + b * w0 + ty;

        var x3 = a * w0 + c * h0 + tx;
        var y3 = d * h0 + b * w0 + ty;

        var x4 =  a * w1 + c * h0 + tx;
        var y4 =  d * h0 + b * w1 + ty;

        minX = x1 < minX ? x1 : minX;
        minX = x2 < minX ? x2 : minX;
        minX = x3 < minX ? x3 : minX;
        minX = x4 < minX ? x4 : minX;

        minY = y1 < minY ? y1 : minY;
        minY = y2 < minY ? y2 : minY;
        minY = y3 < minY ? y3 : minY;
        minY = y4 < minY ? y4 : minY;

        maxX = x1 > maxX ? x1 : maxX;
        maxX = x2 > maxX ? x2 : maxX;
        maxX = x3 > maxX ? x3 : maxX;
        maxX = x4 > maxX ? x4 : maxX;

        maxY = y1 > maxY ? y1 : maxY;
        maxY = y2 > maxY ? y2 : maxY;
        maxY = y3 > maxY ? y3 : maxY;
        maxY = y4 > maxY ? y4 : maxY;
    }

    var bounds = this._bounds;

    bounds.x = minX;
    bounds.width = maxX - minX;

    bounds.y = minY;
    bounds.height = maxY - minY;

    // store a reference so that if this function gets called again in the render cycle we do not have to recalculate
    this._currentBounds = bounds;

    return bounds;
};

/**
 * Renders the object using the WebGL renderer
 *
 * @param renderSession {RenderSession}
 * @private
 */
Sprite.prototype._renderWebGL = function (renderSession) {
    // if the sprite is not visible or the alpha is 0 then no need to render this element
    if (!this.visible || this.alpha <= 0) {
        return;
    }

    var i, j;

    // do a quick check to see if this element has a mask or a filter.
    if (this._mask || this._filters) {
        var spriteBatch = renderSession.spriteBatch;

        // push filter first as we need to ensure the stencil buffer is correct for any masking
        if (this._filters) {
            spriteBatch.flush();
            renderSession.filterManager.pushFilter(this._filterBlock);
        }

        if (this._mask) {
            spriteBatch.stop();
            renderSession.maskManager.pushMask(this.mask, renderSession);
            spriteBatch.start();
        }

        // add this sprite to the batch
        spriteBatch.render(this);

        // now loop through the children and make sure they get rendered
        for (i = 0, j = this.children.length; i < j; i++) {
            this.children[i]._renderWebGL(renderSession);
        }

        // time to stop the sprite batch as either a mask element or a filter draw will happen next
        spriteBatch.stop();

        if (this._mask) {
            renderSession.maskManager.popMask(this._mask, renderSession);
        }

        if (this._filters) {
            renderSession.filterManager.popFilter();
        }

        spriteBatch.start();
    }
    else {
        renderSession.spriteBatch.render(this);

        // simple render children!
        for (i = 0, j = this.children.length; i < j; ++i) {
            this.children[i]._renderWebGL(renderSession);
        }

    }
};

/**
* Renders the object using the Canvas renderer
*
* @param renderSession {RenderSession}
* @private
*/
Sprite.prototype._renderCanvas = function (renderSession) {
    // If the sprite is not visible or the alpha is 0 then no need to render this element
    if (!this.visible || this.alpha <= 0 || this.texture.crop.width <= 0 || this.texture.crop.height <= 0) {
        return;
    }

    if (this.blendMode !== renderSession.currentBlendMode) {
        renderSession.currentBlendMode = this.blendMode;
        renderSession.context.globalCompositeOperation = PIXI.blendModesCanvas[renderSession.currentBlendMode];
    }

    if (this._mask) {
        renderSession.maskManager.pushMask(this._mask, renderSession);
    }

    //  Ignore null sources
    if (this.texture.valid) {
        var resolution = this.texture.baseTexture.resolution / renderSession.resolution;

        renderSession.context.globalAlpha = this.worldAlpha;

        // If smoothingEnabled is supported and we need to change the smoothing property for this texture
        if (renderSession.smoothProperty && renderSession.scaleMode !== this.texture.baseTexture.scaleMode) {
            renderSession.scaleMode = this.texture.baseTexture.scaleMode;
            renderSession.context[renderSession.smoothProperty] = (renderSession.scaleMode === PIXI.scaleModes.LINEAR);
        }

        // If the texture is trimmed we offset by the trim x/y, otherwise we use the frame dimensions
        var dx = (this.texture.trim ? this.texture.trim.x : 0) - (this.anchor.x * this.texture.trim.width);
        var dy = (this.texture.trim ? this.texture.trim.y : 0) - (this.anchor.y * this.texture.trim.height);

        // Allow for pixel rounding
        if (renderSession.roundPixels) {
            renderSession.context.setTransform(
                this.worldTransform.a,
                this.worldTransform.b,
                this.worldTransform.c,
                this.worldTransform.d,
                (this.worldTransform.tx * renderSession.resolution) | 0,
                (this.worldTransform.ty * renderSession.resolution) | 0
            );

            dx = dx | 0;
            dy = dy | 0;
        }
        else {
            renderSession.context.setTransform(
                this.worldTransform.a,
                this.worldTransform.b,
                this.worldTransform.c,
                this.worldTransform.d,
                this.worldTransform.tx * renderSession.resolution,
                this.worldTransform.ty * renderSession.resolution
            );
        }

        if (this.tint !== 0xFFFFFF) {
            if (this.cachedTint !== this.tint) {
                this.cachedTint = this.tint;

                // TODO clean up caching - how to clean up the caches?
                this.tintedTexture = PIXI.CanvasTinter.getTintedTexture(this, this.tint);
            }

            renderSession.context.drawImage(
                this.tintedTexture,
                0,
                0,
                this.texture.crop.width,
                this.texture.crop.height,
                dx / resolution,
                dy / resolution,
                this.texture.crop.width / resolution,
                this.texture.crop.height / resolution
            );
        }
        else {
            renderSession.context.drawImage(
                this.texture.baseTexture.source,
                this.texture.crop.x,
                this.texture.crop.y,
                this.texture.crop.width,
                this.texture.crop.height,
                dx / resolution,
                dy / resolution,
                this.texture.crop.width / resolution,
                this.texture.crop.height / resolution
            );
        }
    }

    for (var i = 0, j = this.children.length; i < j; i++) {
        this.children[i]._renderCanvas(renderSession);
    }

    if (this._mask) {
        renderSession.maskManager.popMask(renderSession);
    }
};

// some helper functions..

/**
 * Helper function that creates a sprite that will contain a texture from the TextureCache based on the frameId
 * The frame ids are created when a Texture packer file has been loaded
 *
 * @static
 * @param frameId {String} The frame Id of the texture in the cache
 * @return {Sprite} A new Sprite using a texture from the texture cache matching the frameId
 */
Sprite.fromFrame = function (frameId) {
    var texture = PIXI.TextureCache[frameId];

    if (!texture) {
        throw new Error('The frameId "' + frameId + '" does not exist in the texture cache' + this);
    }

    return new Sprite(texture);
};

/**
 * Helper function that creates a sprite that will contain a texture based on an image url
 * If the image is not in the texture cache it will be loaded
 *
 * @static
 * @param imageId {String} The image url of the texture
 * @return {Sprite} A new Sprite using a texture from the texture cache matching the image id
 */
Sprite.fromImage = function (imageId, crossorigin, scaleMode) {
    return new Sprite(PIXI.Texture.fromImage(imageId, crossorigin, scaleMode));
};