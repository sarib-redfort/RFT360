import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  listQuerySchema,
  postCategorySchema,
  postSchema,
  Role,
  tagSchema,
  updatePostCategorySchema,
  updatePostSchema,
  updateTagSchema,
  type ListQueryInput,
} from '@rft360/shared';
import { AbstractAdminCrudController } from '../../common/controllers/abstract-admin-crud.controller';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { PostsService } from './posts.service';
import { CategoriesService, TagsService } from './taxonomy.service';

// ── Public ────────────────────────────────────────────────────────────────

@ApiTags('Public · Blog')
@Controller('posts')
export class PublicPostsController {
  constructor(private readonly posts: PostsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List published posts (filter by category/tag)' })
  list(
    @Query() query: unknown,
    @Query('category') category?: string,
    @Query('tag') tag?: string,
    @Query('featured') featured?: string,
  ) {
    const parsed = listQuerySchema.parse(query) as ListQueryInput;
    return this.posts.listPublic({ ...parsed, category, tag, featured: featured === 'true' });
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get a published post by slug (+ related)' })
  bySlug(@Param('slug') slug: string) {
    return this.posts.getPublicBySlug(slug);
  }
}

@ApiTags('Public · Blog')
@Controller('post-categories')
export class PublicCategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List published blog categories' })
  list(@Query() query: unknown) {
    return this.categories.publicList(listQuerySchema.parse(query) as ListQueryInput);
  }
}

@ApiTags('Public · Blog')
@Controller('tags')
export class PublicTagsController {
  constructor(private readonly tags: TagsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all blog tags' })
  list() {
    return this.tags.list();
  }
}

// ── Admin ─────────────────────────────────────────────────────────────────

@ApiTags('Admin · Blog')
@Controller('admin/posts')
@Roles(Role.EDITOR)
export class AdminPostsController extends AbstractAdminCrudController {
  protected readonly createSchema = postSchema;
  protected readonly updateSchema = updatePostSchema;
  constructor(protected readonly service: PostsService) {
    super();
  }
}

@ApiTags('Admin · Blog')
@Controller('admin/post-categories')
@Roles(Role.EDITOR)
export class AdminCategoriesController extends AbstractAdminCrudController {
  protected readonly createSchema = postCategorySchema;
  protected readonly updateSchema = updatePostCategorySchema;
  constructor(protected readonly service: CategoriesService) {
    super();
  }
}

@ApiTags('Admin · Blog')
@Controller('admin/tags')
@Roles(Role.EDITOR)
export class AdminTagsController {
  constructor(private readonly tags: TagsService) {}

  @Get()
  list() {
    return this.tags.list();
  }

  @Post()
  create(@Body() body: unknown) {
    return this.tags.create(tagSchema.parse(body));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: unknown) {
    return this.tags.update(id, updateTagSchema.parse(body));
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tags.remove(id);
  }
}
