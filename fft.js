'use strict';

function isPowerOfTwo(value) {
    return value > 0 && (value & (value - 1)) === 0;
}

const radixPlans = new Map();
const bluesteinPlans = new Map();

function getRadixPlan(length) {
    if (radixPlans.has(length)) {
        return radixPlans.get(length);
    }

    const levels = Math.log2(length);
    const reversed = new Uint32Array(length);
    const cos = new Float64Array(length / 2);
    const sin = new Float64Array(length / 2);

    for (let i = 0; i < length; i += 1) {
        let result = 0;
        for (let value = i, bit = 0; bit < levels; bit += 1, value >>>= 1) {
            result = (result << 1) | (value & 1);
        }
        reversed[i] = result;
    }
    for (let i = 0; i < length / 2; i += 1) {
        const angle = -2 * Math.PI * i / length;
        cos[i] = Math.cos(angle);
        sin[i] = Math.sin(angle);
    }

    const plan = { levels, reversed, cos, sin };
    radixPlans.set(length, plan);
    return plan;
}

function transformRadix2(real, imag) {
    const length = real.length;
    const plan = getRadixPlan(length);

    if (!Number.isInteger(plan.levels)) {
        throw new Error('Radix-2 FFT length must be a power of two');
    }

    for (let i = 0; i < length; i += 1) {
        const reversed = plan.reversed[i];
        if (reversed > i) {
            [real[i], real[reversed]] = [real[reversed], real[i]];
            [imag[i], imag[reversed]] = [imag[reversed], imag[i]];
        }
    }

    for (let size = 2; size <= length; size *= 2) {
        const halfSize = size / 2;
        const tableStep = length / size;
        for (let start = 0; start < length; start += size) {
            for (let offset = 0; offset < halfSize; offset += 1) {
                const tableIndex = offset * tableStep;
                const cos = plan.cos[tableIndex];
                const sin = plan.sin[tableIndex];
                const even = start + offset;
                const odd = even + halfSize;
                const oddReal = real[odd] * cos - imag[odd] * sin;
                const oddImag = real[odd] * sin + imag[odd] * cos;

                real[odd] = real[even] - oddReal;
                imag[odd] = imag[even] - oddImag;
                real[even] += oddReal;
                imag[even] += oddImag;
            }
        }
    }
}

function getBluesteinPlan(length) {
    if (bluesteinPlans.has(length)) {
        return bluesteinPlans.get(length);
    }

    let convolutionLength = 1;
    while (convolutionLength < length * 2 - 1) {
        convolutionLength *= 2;
    }

    const cosTable = new Float64Array(length);
    const sinTable = new Float64Array(length);
    for (let i = 0; i < length; i += 1) {
        const angle = Math.PI * ((i * i) % (length * 2)) / length;
        cosTable[i] = Math.cos(angle);
        sinTable[i] = Math.sin(angle);
    }

    const realB = new Float64Array(convolutionLength);
    const imagB = new Float64Array(convolutionLength);

    for (let i = 0; i < length; i += 1) {
        realB[i] = cosTable[i];
        imagB[i] = sinTable[i];
        if (i !== 0) {
            realB[convolutionLength - i] = cosTable[i];
            imagB[convolutionLength - i] = sinTable[i];
        }
    }

    transformRadix2(realB, imagB);
    const plan = { convolutionLength, cosTable, sinTable, realB, imagB };
    bluesteinPlans.set(length, plan);
    return plan;
}

function transformBluestein(real, imag) {
    const length = real.length;
    const plan = getBluesteinPlan(length);
    const realA = new Float64Array(plan.convolutionLength);
    const imagA = new Float64Array(plan.convolutionLength);

    for (let i = 0; i < length; i += 1) {
        realA[i] = real[i] * plan.cosTable[i] + imag[i] * plan.sinTable[i];
        imagA[i] = -real[i] * plan.sinTable[i] + imag[i] * plan.cosTable[i];
    }

    transformRadix2(realA, imagA);
    for (let i = 0; i < plan.convolutionLength; i += 1) {
        const productReal = realA[i] * plan.realB[i] - imagA[i] * plan.imagB[i];
        const productImag = imagA[i] * plan.realB[i] + realA[i] * plan.imagB[i];
        realA[i] = productReal;
        imagA[i] = productImag;
    }
    inverseTransform(realA, imagA);

    for (let i = 0; i < length; i += 1) {
        real[i] = realA[i] * plan.cosTable[i] + imagA[i] * plan.sinTable[i];
        imag[i] = -realA[i] * plan.sinTable[i] + imagA[i] * plan.cosTable[i];
    }
}

function transform(real, imag) {
    if (real.length !== imag.length) {
        throw new Error('Real and imaginary arrays must have the same length');
    }
    if (real.length === 0) {
        return;
    }

    if (isPowerOfTwo(real.length)) {
        transformRadix2(real, imag);
    } else {
        transformBluestein(real, imag);
    }
}

function inverseTransform(real, imag) {
    const length = real.length;
    for (let i = 0; i < length; i += 1) {
        imag[i] = -imag[i];
    }
    transform(real, imag);
    for (let i = 0; i < length; i += 1) {
        real[i] /= length;
        imag[i] = -imag[i] / length;
    }
}

function transform2D(real, imag, width, height, inverse = false) {
    if (real.length !== width * height || imag.length !== real.length) {
        throw new Error('FFT dimensions do not match the input arrays');
    }

    const transformLine = inverse ? inverseTransform : transform;
    for (let y = 0; y < height; y += 1) {
        const start = y * width;
        transformLine(real.subarray(start, start + width), imag.subarray(start, start + width));
    }

    const columnReal = new Float64Array(height);
    const columnImag = new Float64Array(height);
    for (let x = 0; x < width; x += 1) {
        for (let y = 0; y < height; y += 1) {
            const index = y * width + x;
            columnReal[y] = real[index];
            columnImag[y] = imag[index];
        }
        transformLine(columnReal, columnImag);
        for (let y = 0; y < height; y += 1) {
            const index = y * width + x;
            real[index] = columnReal[y];
            imag[index] = columnImag[y];
        }
    }
}

module.exports = {
    inverseTransform,
    transform,
    transform2D
};
