const dw = require('../index');
const srcImageUrl = '/srcImg.png'
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
run()
