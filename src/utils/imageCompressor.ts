/**
 * Client-side image optimization utility to ensure photos stay well below
 * Firestore's 1MB (1,048,576 bytes) document size limit while preserving crisp visual quality.
 */

export interface CompressImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  maxSizeBytes?: number; // Default 600KB (614,400 bytes) - safely under 1MB Firestore limit
  quality?: number; // Starting quality 0.0 - 1.0
}

export async function compressImageToDataUrl(
  file: File | Blob,
  options: CompressImageOptions = {}
): Promise<string> {
  const {
    maxWidth = 600,
    maxHeight = 600,
    maxSizeBytes = 600 * 1024, // 600 KB
    quality = 0.88,
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));

    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Format gambar tidak valid atau rusak.'));

      img.onload = () => {
        try {
          // Calculate target aspect ratio dimensions
          let targetWidth = img.width;
          let targetHeight = img.height;

          if (targetWidth > maxWidth || targetHeight > maxHeight) {
            const widthRatio = maxWidth / targetWidth;
            const heightRatio = maxHeight / targetHeight;
            const scale = Math.min(widthRatio, heightRatio);
            targetWidth = Math.round(targetWidth * scale);
            targetHeight = Math.round(targetHeight * scale);
          }

          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Gagal memproses gambar (Canvas context tidak tersedia).'));
            return;
          }

          // Use high quality image smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Preserve transparency for PNG / WebP icons
          const isTransparentFormat = file.type === 'image/png' || file.type === 'image/webp';
          ctx.clearRect(0, 0, targetWidth, targetHeight);
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

          // Test formats: WebP if supported and smaller, else PNG or JPEG
          let outputType = isTransparentFormat ? 'image/webp' : 'image/jpeg';
          let currentQuality = quality;
          let dataUrl = canvas.toDataURL(outputType, currentQuality);

          // If webp output isn't smaller or not supported, check png/jpeg
          if (!dataUrl.startsWith(`data:${outputType}`)) {
            outputType = isTransparentFormat ? 'image/png' : 'image/jpeg';
            dataUrl = canvas.toDataURL(outputType, currentQuality);
          }

          // Iterative reduction if dataUrl still exceeds size limit
          let attempts = 0;
          while (dataUrl.length > maxSizeBytes && attempts < 6) {
            attempts++;
            currentQuality = Math.max(0.4, currentQuality - 0.15);
            // Also scale down canvas dimensions if still too big
            if (canvas.width > 300) {
              const newCanvas = document.createElement('canvas');
              newCanvas.width = Math.round(canvas.width * 0.85);
              newCanvas.height = Math.round(canvas.height * 0.85);
              const newCtx = newCanvas.getContext('2d');
              if (newCtx) {
                newCtx.imageSmoothingEnabled = true;
                newCtx.imageSmoothingQuality = 'high';
                newCtx.drawImage(canvas, 0, 0, newCanvas.width, newCanvas.height);
                canvas.width = newCanvas.width;
                canvas.height = newCanvas.height;
                const replaceCtx = canvas.getContext('2d');
                replaceCtx?.drawImage(newCanvas, 0, 0);
              }
            }

            dataUrl = canvas.toDataURL(outputType, currentQuality);
          }

          resolve(dataUrl);
        } catch (err) {
          reject(err);
        }
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}
