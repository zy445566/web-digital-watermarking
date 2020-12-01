const lib = require('./lib.js');
const opencvData = require('./opencv.json');
class DigitalWatermarking{
    static loadCV(url){
        if(DigitalWatermarking.loadedCv) {
            return Promise.resolve()
        }
        const script = document.createElement('script');
        script.async="async"
        script.src = url;
        script.type = 'text/javascript';
        document.querySelector('body').appendChild(script);
        return new Promise((reslove,reject)=>{
            script.onload = function() {
                DigitalWatermarking.loadedCv = true;
                return reslove();
            };
            script.onerror = function() {
                return reject('cv loading error:'+url);
            };
        })
    }
    static getImageElementByUrl(url) {
        // const imgElement = document.createElement('img');
        const imgElement = new Image();
        imgElement.src = url;
        return new Promise((reslove,reject)=>{
            imgElement.onload = function() {
                return reslove(imgElement);
            };
            imgElement.onerror = function() {
                return reject('image loading error:'+url);
            };
        })
    }
    static getCanvasBase64Url(canvas) {
        const dataURL = canvas.toDataURL();
        return dataURL;
    }

    static async transformImageUrlWithText(srcImageUrl,watermarkText,fontSize) {
        await DigitalWatermarking.loadCV(opencvData.base64url);
        return DigitalWatermarking.getCanvasBase64Url(await lib.transformImageWithText(
            await DigitalWatermarking.getImageElementByUrl(srcImageUrl),
            watermarkText,fontSize
        ));
    }

    static async getTextFormImageUrl(enCodeImageUrl)
    {
        await DigitalWatermarking.loadCV(opencvData.base64url);
        return DigitalWatermarking.getCanvasBase64Url(await lib.getTextFormImage(
            await DigitalWatermarking.getImageElementByUrl(enCodeImageUrl)
        ));
    }
}
module.exports = DigitalWatermarking;