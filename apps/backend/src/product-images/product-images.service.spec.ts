import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ProductImagesService } from './product-images.service';

// Mock sharp and fs to avoid actual disk/image operations
jest.mock('sharp', () => () => ({
  resize: jest.fn().mockReturnThis(),
  webp: jest.fn().mockReturnThis(),
  toFile: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: jest.fn().mockReturnValue(false),
  mkdirSync: jest.fn(),
}));

describe('ProductImagesService', () => {
  let service: ProductImagesService;

  const configMock = {
    get: jest.fn((key: string) => {
      if (key === 'PUBLIC_URL') return 'http://localhost:3000';
      return undefined;
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductImagesService,
        { provide: ConfigService, useValue: configMock },
      ],
    }).compile();

    service = module.get<ProductImagesService>(ProductImagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAbsolutePath()', () => {
    it('returns an absolute path string containing the relative path', () => {
      const result = service.getAbsolutePath('albert_heijn/product.webp');
      expect(result).toContain('albert_heijn');
      expect(result).toContain('product.webp');
    });
  });

  describe('exists()', () => {
    it('returns false for a non-existent path (mocked existsSync returns false)', () => {
      expect(service.exists('albert_heijn/missing.webp')).toBe(false);
    });
  });

  describe('downloadAndSave() — URL normalization', () => {
    it('returns null for undefined image URL', async () => {
      const result = await service.downloadAndSave(undefined as unknown as string, 'Albert Heijn', 'id-1');
      expect(result).toBeNull();
    });

    it('returns null for empty string URL', async () => {
      const result = await service.downloadAndSave('', 'Albert Heijn', 'id-1');
      expect(result).toBeNull();
    });

    it('returns null for whitespace-only URL', async () => {
      const result = await service.downloadAndSave('   ', 'Albert Heijn', 'id-1');
      expect(result).toBeNull();
    });

    it('returns null for non-URL string (no scheme, no slash)', async () => {
      const result = await service.downloadAndSave('not-a-url', 'Albert Heijn', 'id-1');
      expect(result).toBeNull();
    });

    it('returns null when fetch returns a non-OK response', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 404 } as Response);
      const result = await service.downloadAndSave('https://example.com/img.jpg', 'Albert Heijn', 'test-id');
      expect(result).toBeNull();
    });

    it('returns null when fetch throws a network error', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network timeout'));
      const result = await service.downloadAndSave('https://example.com/img.jpg', 'Albert Heijn', 'test-id');
      expect(result).toBeNull();
    });

    it('accepts https:// URLs', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(8),
      } as Response);
      // should not return null (proceeds to sharp which is mocked)
      const result = await service.downloadAndSave('https://static.ah.nl/img.jpg', 'Albert Heijn', 'ah-001');
      expect(result).not.toBeNull();
      expect(result).toContain('albert_heijn');
      expect(result).toContain('.webp');
    });

    it('accepts protocol-relative // URLs by prepending https:', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(8),
      } as Response);
      const result = await service.downloadAndSave('//static.ah.nl/img.jpg', 'Albert Heijn', 'ah-002');
      expect(result).not.toBeNull();
      // fetch should have been called with https://
      expect((global.fetch as jest.Mock).mock.calls[0][0]).toMatch(/^https:\/\//);
    });

    it('accepts root-relative / URLs by prepending default origin', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(8),
      } as Response);
      const result = await service.downloadAndSave('/dam/product/img.jpg', 'Albert Heijn', 'ah-003');
      expect(result).not.toBeNull();
      expect((global.fetch as jest.Mock).mock.calls[0][0]).toMatch(/^https:\/\/www\.ah\.nl/);
    });
  });

  describe('replaceWithLocalImages()', () => {
    it('removes image from product when download fails', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 404 } as Response);
      const products = [{ image: 'https://example.com/img.jpg', retailer: 'Albert Heijn', externalId: 'ah-x' }];
      await service.replaceWithLocalImages(products);
      expect(products[0].image).toBeUndefined();
    });

    it('removes image from product when URL is invalid', async () => {
      const products = [{ image: 'not-a-url', retailer: 'Albert Heijn', externalId: 'ah-y' }];
      await service.replaceWithLocalImages(products);
      expect(products[0].image).toBeUndefined();
    });

    it('replaces image with local URL on success', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(8),
      } as Response);
      const products = [{ image: 'https://example.com/img.jpg', retailer: 'Albert Heijn', externalId: 'ah-z' }];
      await service.replaceWithLocalImages(products);
      expect(products[0].image).toContain('http://localhost:3000/api/assets/product-images');
    });

    it('skips products with no image field', async () => {
      const products = [{ retailer: 'Albert Heijn', externalId: 'ah-noimg' }];
      await expect(service.replaceWithLocalImages(products)).resolves.not.toThrow();
    });
  });
});
