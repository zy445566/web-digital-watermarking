# web-digital-watermarking

Embed text in an image's frequency domain and reveal it through the image's
Fourier spectrum. The browser implementation is self-contained and does not
load or bundle OpenCV.js.

## Install

```sh
npm install web-digital-watermarking
```

This package is intended for browsers. For Node.js, use
[node-digital-watermarking](https://github.com/zy445566/node-digital-watermarking).

## Usage

```js
const dw = require('web-digital-watermarking');

const srcImageUrl = 'http://localhost:8080/srcImg.png';
const watermarkText = 'github.com/zy445566';
const fontSize = 1.1;

async function run() {
    const encodedImageUrl = await dw.transformImageUrlWithText(
        srcImageUrl,
        watermarkText,
        fontSize
    );
    const encodedImage = document.createElement('img');
    encodedImage.src = encodedImageUrl;
    document.body.appendChild(encodedImage);

    const spectrumImageUrl = await dw.getTextFormImageUrl(encodedImageUrl);
    const spectrumImage = document.createElement('img');
    spectrumImage.src = spectrumImageUrl;
    document.body.appendChild(spectrumImage);
}

run();
```

Images loaded from another origin must be served with an appropriate CORS
header because the implementation reads their pixels through Canvas.

## Implementation

- Radix-2 FFT handles power-of-two dimensions.
- Bluestein's algorithm handles arbitrary image dimensions.
- A two-dimensional FFT embeds the text mask into conjugate frequency bins.
- The inverse FFT reconstructs the encoded image without native or WebAssembly
  dependencies.
