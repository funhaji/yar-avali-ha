import sharp from 'sharp'

export interface ImageOptimizationOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
}

export interface OptimizedImageResult {
  buffer: Buffer
  contentType: string
  extension: string
  originalSize: number
  optimizedSize: number
  savedPercent: number
}

/**
 * Optimizes an uploaded image buffer by resizing and converting to WebP.
 * Drastically reduces Vercel Blob storage & egress data transfer.
 */
export async function optimizeImageBuffer(
  inputBuffer: Buffer,
  options: ImageOptimizationOptions = {}
): Promise<OptimizedImageResult> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 80
  } = options

  const originalSize = inputBuffer.length

  try {
    // Process through sharp: resize if larger than bounds, convert to WebP
    const optimizedBuffer = await sharp(inputBuffer)
      .rotate() // automatically rotate based on EXIF orientation
      .resize({
        width: maxWidth,
        height: maxHeight,
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality, effort: 4 })
      .toBuffer()

    const optimizedSize = optimizedBuffer.length
    const savedPercent = Math.max(0, Math.round(((originalSize - optimizedSize) / originalSize) * 100))

    return {
      buffer: optimizedBuffer,
      contentType: 'image/webp',
      extension: 'webp',
      originalSize,
      optimizedSize,
      savedPercent
    }
  } catch (error) {
    console.warn('[ImageOptimizer] Failed to optimize image, falling back to original:', error)
    return {
      buffer: inputBuffer,
      contentType: 'image/jpeg',
      extension: 'jpg',
      originalSize,
      optimizedSize: originalSize,
      savedPercent: 0
    }
  }
}
