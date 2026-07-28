import { Body, Controller, Delete, Injectable, Module, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CACHE_TAGS,
  galleryAlbumSchema,
  galleryImageSchema,
  Role,
  updateGalleryAlbumSchema,
} from '@rft360/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { RevalidationService } from '../revalidation/revalidation.service';
import { PublishableCrudService } from '../../common/services/publishable-crud.service';
import { AbstractAdminCrudController } from '../../common/controllers/abstract-admin-crud.controller';
import { AbstractPublicCrudController } from '../../common/controllers/abstract-public-crud.controller';
import { Roles } from '../../common/decorators/roles.decorator';
import { galleryAlbumInclude } from '../../common/prisma-includes';

/** Photo albums — publishable, each holding an ordered set of gallery images. */
@Injectable()
export class GalleryService extends PublishableCrudService {
  constructor(prisma: PrismaService, redis: RedisService, revalidation: RevalidationService) {
    super(prisma, redis, revalidation, {
      model: 'galleryAlbum',
      cacheTag: CACHE_TAGS.gallery,
      slugSource: 'title',
      searchFields: ['title', 'description'],
      include: galleryAlbumInclude,
      extraRevalidateTags: [CACHE_TAGS.homepage],
      defaultSort: { field: 'order', order: 'asc' },
    });
  }

  /** Attaches an already-uploaded media item to an album. */
  async addImage(input: { albumId: string; mediaId: string; caption?: string; order?: number }) {
    const image = await this.prisma.galleryImage.create({
      data: {
        albumId: input.albumId,
        mediaId: input.mediaId,
        caption: input.caption,
        order: input.order ?? 0,
      },
      include: { media: true },
    });
    await this.afterMutation();
    return image;
  }

  async removeImage(id: string) {
    await this.prisma.galleryImage.delete({ where: { id } });
    await this.afterMutation();
    return { id };
  }
}

@ApiTags('Public · Gallery')
@Controller('gallery-albums')
export class PublicGalleryController extends AbstractPublicCrudController {
  constructor(protected readonly service: GalleryService) {
    super();
  }
}

@ApiTags('Admin · Gallery')
@Controller('admin/gallery-albums')
@Roles(Role.EDITOR)
export class AdminGalleryController extends AbstractAdminCrudController {
  protected readonly createSchema = galleryAlbumSchema;
  protected readonly updateSchema = updateGalleryAlbumSchema;
  constructor(protected readonly service: GalleryService) {
    super();
  }

  @Post('images')
  @ApiOperation({ summary: 'Attach a media item to an album' })
  addImage(@Body() body: unknown) {
    return this.service.addImage(galleryImageSchema.parse(body));
  }

  @Delete('images/:id')
  @ApiOperation({ summary: 'Remove an image from its album' })
  removeImage(@Param('id') id: string) {
    return this.service.removeImage(id);
  }
}

@Module({
  controllers: [PublicGalleryController, AdminGalleryController],
  providers: [GalleryService],
  exports: [GalleryService],
})
export class GalleryModule {}
