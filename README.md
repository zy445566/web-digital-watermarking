# web-digital-watermarking
A digital watermark is a kind of marker covertly embedded in a noise-tolerant signal such as an audio, video or image data. It is typically used to identify ownership of the copyright of such signal. "Watermarking" is the process of hiding digital information in a carrier signal; the hidden information should, but does not need to, contain a relation to the carrier signal. Digital watermarks may be used to verify the authenticity or integrity of the carrier signal or to show the identity of its owners. It is prominently used for tracing copyright infringements and for banknote authentication.

# package install
```
npm install web-digital-watermarking
```
This package is only used for the Web, if you are using Node.js, use [node-digital-watermarking](https://github.com/zy445566/node-digital-watermarking).

# Sample Use
```js
const dw = require('web-digital-watermarking');
const srcImageUrl = 'http://localhost:8080/srcImg.png'
let watermarkText = "github.com/zy445566";
let fontSize = 1.1;
async function run() {
    const enCodeImageUrl = await dw.transformImageUrlWithText(srcImageUrl, watermarkText, fontSize);
    const enCodeImageElement = document.createElement('img');
    enCodeImageElement.src = enCodeImageUrl;
    document.body.appendChild(enCodeImageElement)
    const deCodeImageUrl = await dw.getTextFormImageUrl(enCodeImageUrl);
    const deCodeImageElement = document.createElement('img');
    deCodeImageElement.src = deCodeImageUrl;
    document.body.appendChild(deCodeImageElement)
}
run();
```
