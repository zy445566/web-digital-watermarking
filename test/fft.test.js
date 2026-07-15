'use strict';

const assert = require('assert');
const { inverseTransform, transform, transform2D } = require('../fft.js');

const EPSILON = 1e-8;

function assertClose(actual, expected, message) {
    assert.ok(Math.abs(actual - expected) < EPSILON, `${message}: ${actual} != ${expected}`);
}

function directDft(inputReal, inputImag) {
    const length = inputReal.length;
    const real = new Float64Array(length);
    const imag = new Float64Array(length);
    for (let frequency = 0; frequency < length; frequency += 1) {
        for (let sample = 0; sample < length; sample += 1) {
            const angle = -2 * Math.PI * frequency * sample / length;
            real[frequency] += inputReal[sample] * Math.cos(angle) - inputImag[sample] * Math.sin(angle);
            imag[frequency] += inputReal[sample] * Math.sin(angle) + inputImag[sample] * Math.cos(angle);
        }
    }
    return { real, imag };
}

for (const length of [1, 2, 3, 5, 8, 11, 16]) {
    const inputReal = Float64Array.from({ length }, (_, index) => Math.sin(index * 0.7) + index / 3);
    const inputImag = Float64Array.from({ length }, (_, index) => Math.cos(index * 0.2) / 4);
    const expected = directDft(inputReal, inputImag);
    const real = inputReal.slice();
    const imag = inputImag.slice();

    transform(real, imag);
    for (let i = 0; i < length; i += 1) {
        assertClose(real[i], expected.real[i], `real DFT value for length ${length}, index ${i}`);
        assertClose(imag[i], expected.imag[i], `imaginary DFT value for length ${length}, index ${i}`);
    }

    inverseTransform(real, imag);
    for (let i = 0; i < length; i += 1) {
        assertClose(real[i], inputReal[i], `real round trip for length ${length}, index ${i}`);
        assertClose(imag[i], inputImag[i], `imaginary round trip for length ${length}, index ${i}`);
    }
}

const width = 7;
const height = 5;
const real2D = Float64Array.from({ length: width * height }, (_, index) => (index * 17) % 251);
const original2D = real2D.slice();
const imag2D = new Float64Array(real2D.length);
transform2D(real2D, imag2D, width, height);
transform2D(real2D, imag2D, width, height, true);

for (let i = 0; i < real2D.length; i += 1) {
    assertClose(real2D[i], original2D[i], `2D real round trip at index ${i}`);
    assertClose(imag2D[i], 0, `2D imaginary round trip at index ${i}`);
}

console.log('FFT tests passed');
