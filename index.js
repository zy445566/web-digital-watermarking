'use strict';

const lib = require('./lib.js');

class DigitalWatermarking {
    static getImageElementByUrl(url) {
        const imageElement = new Image();
        imageElement.crossOrigin = 'anonymous';

        return new Promise((resolve, reject) => {
            imageElement.onload = function onload() {
                resolve(imageElement);
            };
            imageElement.onerror = function onerror() {
                reject(new Error(`image loading error: ${url}`));
            };
            imageElement.src = url;
        });
    }

    static getCanvasBlobUrl(canvas) {
        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error('canvas encoding failed'));
                    return;
                }
                resolve(URL.createObjectURL(blob));
            }, 'image/png');
        });
    }

    static async transformImageUrlWithText(srcImageUrl, watermarkText, fontSize) {
        const imageElement = await DigitalWatermarking.getImageElementByUrl(srcImageUrl);
        const canvas = await lib.transformImageWithText(imageElement, watermarkText, fontSize);
        return DigitalWatermarking.getCanvasBlobUrl(canvas);
    }

    static async getTextFormImageUrl(encodedImageUrl) {
        const imageElement = await DigitalWatermarking.getImageElementByUrl(encodedImageUrl);
        const canvas = await lib.getTextFormImage(imageElement);
        return DigitalWatermarking.getCanvasBlobUrl(canvas);
    }
}

module.exports = DigitalWatermarking;
