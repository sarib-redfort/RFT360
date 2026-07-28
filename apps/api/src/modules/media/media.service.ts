import { Injectable, NotFoundException } from '@nestjs/common';
import {
  buildPaginationMeta,
  type ListQueryInput,
  type PaginatedResult,
  type UpdateMediaInput,
} from '@rft360/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

/**
 * Manages the media library: upload -> process -> persist, plus listing,
 * metadata edits and deletion (which also removes the underlying objects).
 */
@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async upload(file: Express.Multer.File, uploaderId: string, folder = 'uploads') {
    const processed = await this.storage.processUpload(file, folder);
    return this.prisma.media.create({
      data: {
        type: processed.type,
        storageKey: processed.storageKey,
        filename: processed.filename,
        originalName: file.originalname,
        mimeType: processed.mimeType,
        size: processed.size,
        width: processed.width,
        height: processed.height,
        variants: processed.variants as never,
        blurDataUrl: processed.blurDataUrl,
        folder,
        uploadedById: uploaderId,
      },
    });
  }

  async list(query: ListQueryInput & { type?: string; folder?: string }): Promise<
    PaginatedResult<unknown>
  > {
    const where: Record<string, unknown> = {};
    if (query.search) {
      where.OR = [
        { originalName: { contains: query.search, mode: 'insensitive' } },
        { alt: { contains: query.search, mode: 'insensitive' } },
        { title: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.type) where.type = query.type;
    if (query.folder) where.folder = query.folder;

    const skip = (query.page - 1) * query.limit;
    const [data, total] = await Promise.all([
      this.prisma.media.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
      }),
      this.prisma.media.count({ where }),
    ]);
    return { data, meta: buildPaginationMeta(total, query.page, query.limit) };
  }

  async findById(id: string) {
    const media = await this.prisma.media.findUnique({ where: { id } });
    if (!media) throw new NotFoundException('Media not found');
    return media;
  }

  async updateMeta(id: string, input: UpdateMediaInput) {
    await this.findById(id);
    return this.prisma.media.update({ where: { id }, data: input });
  }

  async remove(id: string) {
    const media = await this.findById(id);
    // Remove the original plus every generated variant from the store.
    const variantKeys = media.variants
      ? Object.values(media.variants as Record<string, { key: string }>).map((v) => v.key)
      : [];
    await this.storage.delete(media.storageKey, ...variantKeys);
    await this.prisma.media.delete({ where: { id } });
    return { id };
  }
}
