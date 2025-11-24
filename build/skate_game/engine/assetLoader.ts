/* ============================================================================
   ASSET LOADER — SAFE IMAGE CACHING
   INVERT FM Skate Game
   ============================================================================ */

const imageCache = new Map<string, HTMLImageElement>();

/**
 * Loads an image safely with caching.
 * Always returns a Promise<HTMLImageElement>.
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        // Already loaded? Return instantly.
        if (imageCache.has(src)) {
            resolve(imageCache.get(src)!);
            return;
        }

        const img = new Image();
        img.src = src;

        img.onload = () => {
            imageCache.set(src, img);
            resolve(img);
        };

        img.onerror = (err) => {
            console.error("Image failed to load:", src, err);
            reject(err);
        };
    });
}
