const lib = require('./lib.js');
const opencvData = require('./opencv.json');

// 使用之前直接使用base64Url导致浏览器控制台network卡死，而使用BlobUrl则速度快很多
function bufferToBlobUrl(bufferJson,type='') {
    const fileBlob = new Blob([new Uint8Array(bufferJson)],{type});
    return URL.createObjectURL(fileBlob);
}
class DigitalWatermarking{
    static loadCV(url){
        // 由于使用了base64URL导致卡的问题
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
    static getCanvasBlobUrl(canvas) {
        // base64图片地址会发生控制台network卡慢问题
        // const dataURL = canvas.toDataURL();
        return new Promise((reslove)=>{
            canvas.toBlob(function(blob) {
                return reslove(URL.createObjectURL(blob));
            })
        });
    }

    static async transformImageUrlWithText(srcImageUrl,watermarkText,fontSize) {
        await DigitalWatermarking.loadCV(bufferToBlobUrl(opencvData.buffer.data,'text/javascript'));
        return await DigitalWatermarking.getCanvasBlobUrl(await lib.transformImageWithText(
            await DigitalWatermarking.getImageElementByUrl(srcImageUrl),
            watermarkText,fontSize
        ));
    }

    static async getTextFormImageUrl(enCodeImageUrl)
    {
        await DigitalWatermarking.loadCV(bufferToBlobUrl(opencvData.buffer.data,'text/javascript'));
        return await DigitalWatermarking.getCanvasBlobUrl(await lib.getTextFormImage(
            await DigitalWatermarking.getImageElementByUrl(enCodeImageUrl)
        ));
    }
}
module.exports = DigitalWatermarking;