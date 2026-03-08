import { Injectable, Logger } from '@nestjs/common';
import { createWorker } from 'tesseract.js';

export interface OcrResult {
  text: string;
  confidence?: number;
}

/**
 * Strips data URL prefix if present and returns raw base64 string.
 */
function toRawBase64(value: string): string {
  const match = value.match(/^data:image\/[a-z]+;base64,(.+)$/i);
  return match ? match[1].trim() : value.trim();
}

@Injectable()
export class ReceiptsService {
  private readonly logger = new Logger(ReceiptsService.name);

  /**
   * Runs OCR on a base64-encoded receipt image (JPEG/PNG).
   * Uses Dutch + English for Dutch supermarket receipts.
   */
  async recognizeFromBase64(imageBase64: string): Promise<OcrResult> {
    const base64 = toRawBase64(imageBase64);
    if (!base64) {
      throw new Error('Missing image data');
    }

    const worker = await createWorker('nld+eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          this.logger.debug(`OCR progress: ${Math.round((m.progress || 0) * 100)}%`);
        }
      },
    });

    try {
      const {
        data: { text, confidence },
      } = await worker.recognize(base64);
      this.logger.log(`OCR complete. Confidence: ${confidence?.toFixed(1) ?? 'n/a'}%`);
      return { text: text ?? '', confidence };
    } finally {
      await worker.terminate();
    }
  }
}
