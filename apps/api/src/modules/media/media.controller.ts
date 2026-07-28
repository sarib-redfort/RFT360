import {
  Controller,
  Delete,
  Get,
  Param,
  ParseFilePipeBuilder,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  listQuerySchema,
  Role,
  UPLOAD_LIMITS,
  updateMediaSchema,
  type ListQueryInput,
  type UpdateMediaInput,
} from '@rft360/shared';
import { Roles } from '../../common/decorators/roles.decorator';
import { Audit } from '../../common/decorators/audit.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodBody } from '../../common/decorators/zod-body.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { MediaService } from './media.service';

const allowedMimeTypes = [
  ...UPLOAD_LIMITS.allowedImageMimeTypes,
  ...UPLOAD_LIMITS.allowedDocumentMimeTypes,
].join('|');

@ApiTags('Admin · Media')
@Controller('admin/media')
@Roles(Role.EDITOR)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  @ApiOperation({ summary: 'List media library items' })
  list(
    @Query(new ZodValidationPipe(listQuerySchema)) query: ListQueryInput,
    @Query('type') type?: string,
    @Query('folder') folder?: string,
  ) {
    return this.mediaService.list({ ...query, type, folder });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a media item' })
  findOne(@Param('id') id: string) {
    return this.mediaService.findById(id);
  }

  @Post('upload')
  @Audit('UPLOAD', 'Media')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a file (image or document)' })
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: new RegExp(allowedMimeTypes) })
        .addMaxSizeValidator({ maxSize: UPLOAD_LIMITS.maxImageBytes })
        .build({ fileIsRequired: true }),
    )
    file: Express.Multer.File,
    @CurrentUser('sub') userId: string,
    @Query('folder') folder?: string,
  ) {
    return this.mediaService.upload(file, userId, folder);
  }

  @Patch(':id')
  @Audit('UPDATE', 'Media')
  @ApiOperation({ summary: 'Update media metadata (alt, caption, title)' })
  updateMeta(@Param('id') id: string, @ZodBody(updateMediaSchema) dto: UpdateMediaInput) {
    return this.mediaService.updateMeta(id, dto);
  }

  @Delete(':id')
  @Audit('DELETE', 'Media')
  @ApiOperation({ summary: 'Delete a media item and its stored files' })
  remove(@Param('id') id: string) {
    return this.mediaService.remove(id);
  }
}
