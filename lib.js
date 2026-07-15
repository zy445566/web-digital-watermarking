'use strict';

const { transform2D } = require('./fft.js');

function createCanvas(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
}

function readImage(imageElement) {
    const width = imageElement.naturalWidth || imageElement.width;
    const height = imageElement.naturalHeight || imageElement.height;
    if (!width || !height) {
        throw new Error('read image failed');
    }

    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) {
        throw new Error('Canvas 2D is not supported by this browser');
    }
    context.drawImage(imageElement, 0, 0, width, height);
    return {
        imageData: context.getImageData(0, 0, width, height),
        width,
        height
    };
}

function writeImage(imageData) {
    const canvas = createCanvas(imageData.width, imageData.height);
    const context = canvas.getContext('2d');
    if (!context) {
        throw new Error('Canvas 2D is not supported by this browser');
    }
    context.putImageData(imageData, 0, 0);
    return canvas;
}

function getFirstChannel(imageData) {
    const channel = new Float64Array(imageData.width * imageData.height);
    for (let i = 0; i < channel.length; i += 1) {
        // OpenCV's imread() returns RGBA, so channel 0 is the red channel.
        channel[i] = imageData.data[i * 4];
    }
    return channel;
}

function createTextMask(width, height, watermarkText, fontSize) {
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) {
        throw new Error('Canvas 2D is not supported by this browser');
    }

    const pixelSize = Math.max(1, fontSize * 22);
    context.font = `${pixelSize}px sans-serif`;
    context.textBaseline = 'alphabetic';
    context.lineJoin = 'round';
    context.lineWidth = Math.max(1, fontSize * 2);
    context.strokeStyle = '#fff';
    context.strokeText(watermarkText, width / 2, height / 2);
    context.strokeText(watermarkText, 45, 45);

    return context.getImageData(0, 0, width, height).data;
}

function applyWatermark(real, imag, width, height, watermarkText, fontSize) {
    const mask = createTextMask(width, height, watermarkText, fontSize);
    for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
            if (mask[(y * width + x) * 4 + 3] === 0) {
                continue;
            }

            const index = y * width + x;
            const symmetricX = (width - x) % width;
            const symmetricY = (height - y) % height;
            const symmetricIndex = symmetricY * width + symmetricX;
            real[index] = 0;
            imag[index] = 0;
            real[symmetricIndex] = 0;
            imag[symmetricIndex] = 0;
        }
    }
}

function clampByte(value) {
    if (!Number.isFinite(value) || value <= 0) {
        return 0;
    }
    if (value >= 255) {
        return 255;
    }
    return Math.round(value);
}

function replaceFirstChannel(imageData, channel) {
    for (let i = 0; i < channel.length; i += 1) {
        imageData.data[i * 4] = clampByte(channel[i]);
    }
}

function createSpectrumImageData(real, imag, width, height) {
    const magnitude = new Float64Array(real.length);
    let minimum = Infinity;
    let maximum = -Infinity;

    for (let i = 0; i < magnitude.length; i += 1) {
        const value = Math.log1p(Math.hypot(real[i], imag[i]));
        magnitude[i] = value;
        minimum = Math.min(minimum, value);
        maximum = Math.max(maximum, value);
    }

    const output = new ImageData(width, height);
    const scale = maximum > minimum ? 255 / (maximum - minimum) : 0;
    const shiftX = Math.floor(width / 2);
    const shiftY = Math.floor(height / 2);

    for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
            const sourceIndex = y * width + x;
            const targetX = (x + shiftX) % width;
            const targetY = (y + shiftY) % height;
            const targetIndex = targetY * width + targetX;
            const value = clampByte((magnitude[sourceIndex] - minimum) * scale);
            const offset = targetIndex * 4;
            output.data[offset] = value;
            output.data[offset + 1] = value;
            output.data[offset + 2] = value;
            output.data[offset + 3] = 255;
        }
    }
    return output;
}

async function transformImageWithText(imageElement, watermarkText, fontSize) {
    if (typeof watermarkText !== 'string') {
        throw new Error('watermarkText must be string');
    }
    if (typeof fontSize !== 'number' || !Number.isFinite(fontSize) || fontSize <= 0) {
        throw new Error('fontSize must be a positive number');
    }

    const { imageData, width, height } = readImage(imageElement);
    const real = getFirstChannel(imageData);
    const imag = new Float64Array(real.length);
    transform2D(real, imag, width, height);
    applyWatermark(real, imag, width, height, watermarkText, fontSize);
    transform2D(real, imag, width, height, true);
    replaceFirstChannel(imageData, real);
    return writeImage(imageData);
}

async function getTextFormImage(imageElement) {
    const { imageData, width, height } = readImage(imageElement);
    const real = getFirstChannel(imageData);
    const imag = new Float64Array(real.length);
    transform2D(real, imag, width, height);
    return writeImage(createSpectrumImageData(real, imag, width, height));
}

module.exports = {
    getTextFormImage,
    transformImageWithText
};
