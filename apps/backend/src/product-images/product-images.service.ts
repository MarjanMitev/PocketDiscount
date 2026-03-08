import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import sharp from 'sharp';

const DATA_DIR = 'data';
const IMAGES_SUBDIR = 'product-images';
const MAX_SIZE = 400;
const WEBP_QUALITY = 82;
const CONCURRENCY = 5;

const IMAGE_FETCH_HEADERS: HeadersInit = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
};

function sanitize(str: string): string {
  return str.replace(/[^a-zA-Z0-9-_]/g, '_').slice(0, 120) || 'image';
}

function slugRetailer(retailer: string): string {
  return sanitize(retailer.replace(/\s+/g, '_').toLowerCase());
}

/** Normalize to absolute https URL so we can fetch. Handles //, http, https, and path-only. */
function normalizeImageUrl(url: string | undefined, defaultOrigin = 'https://www.ah.nl'): string | null {
  if (!url?.trim()) return null;
  const u = url.trim();
  if (u.startsWith('https://')) return u;
  if (u.startsWith('http://')) return u;
  if (u.startsWith('//')) return `https:${u}`;
  if (u.startsWith('/')) return `${defaultOrigin.replace(/\/$/, '')}${u}`;
  return null;
}

@Injectable()
export class ProductImagesService {
  private readonly logger = new Logger(ProductImagesService.name);
  private readonly dataDir: string;

  constructor(private readonly config: ConfigService) {
    this.dataDir = join(process.cwd(), DATA_DIR, IMAGES_SUBDIR);
  }

  /** Returns relative path like "albert_heijn/abc123.webp" or null on failure. */
  async downloadAndSave(
    imageUrl: string,
    retailer: string,
    externalId: string,
  ): Promise<string | null> {
    const url = normalizeImageUrl(imageUrl);
    if (!url) return null;
    const slug = slugRetailer(retailer);
    const id = sanitize(externalId);
    const filename = `${id}.webp`;
    const relPath = `${slug}/${filename}`;
    const absPath = join(this.dataDir, slug, filename);

    if (existsSync(absPath)) return relPath;

    try {
      const res = await fetch(url, {
        headers: IMAGE_FETCH_HEADERS,
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) {
        this.logger.debug(`Image ${res.status} for ${retailer}/${externalId}: ${url.slice(0, 60)}...`);
        return null;
      }
      const buf = Buffer.from(await res.arrayBuffer());
      const dir = join(this.dataDir, slug);
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
      await sharp(buf)
        .resize(MAX_SIZE, MAX_SIZE, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toFile(absPath);
      return relPath;
    } catch (err) {
      this.logger.debug(`Image fetch failed for ${retailer}/${externalId}: ${err}`);
      return null;
    }
  }

  getAbsolutePath(relPath: string): string {
    return join(this.dataDir, relPath);
  }

  exists(relPath: string): boolean {
    return existsSync(this.getAbsolutePath(relPath));
  }

  /** Process products in batches; replace image URLs with local when download succeeds; clear when it fails to avoid 404s. */
  async replaceWithLocalImages(
    products: { image?: string; retailer: string; externalId: string }[],
  ): Promise<void> {
    const baseUrl = this.config.get('PUBLIC_URL') ?? 'http://localhost:3000';
    const imageBase = `${baseUrl}/api/assets/product-images`;

    for (let i = 0; i < products.length; i += CONCURRENCY) {
      const batch = products.slice(i, i + CONCURRENCY);
      await Promise.all(
        batch.map(async (p) => {
          const normalized = normalizeImageUrl(p.image);
          if (!normalized) {
            if (p.image) delete p.image;
            return;
          }
          const rel = await this.downloadAndSave(normalized, p.retailer, p.externalId);
          if (rel) {
            p.image = `${imageBase}/${rel}`;
          } else {
            delete p.image;
          }
        }),
      );
    }
  }
}
