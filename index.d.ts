declare class DigitalWatermarking {
    static transformImageUrlWithText(
        srcImageUrl: string,
        watermarkText: string,
        fontSize: number
    ): Promise<string>;

    static getTextFormImageUrl(encodedImageUrl: string): Promise<string>;
}

export = DigitalWatermarking;
