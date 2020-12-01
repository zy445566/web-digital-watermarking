declare class DigitalWatermarking {
    static transformImageUrlWithText(
        srcImageUrl:string,watermarkText:string,
        fontSize:number
    ):Promise<string>;
    static getTextFormImageUrl(enCodeImageUrl:string):Promise<string>;
}
export function transformImageUrlWithText(
    srcImageUrl:string,watermarkText:string,
    fontSize:number
):Promise<string>;
export function getTextFormImageUrl(enCodeImageUrl:string):Promise<string>;
