import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CategoriesService, TagsService } from './taxonomy.service';
import {
  AdminCategoriesController,
  AdminPostsController,
  AdminTagsController,
  PublicCategoriesController,
  PublicPostsController,
  PublicTagsController,
} from './blog.controllers';

@Module({
  controllers: [
    PublicPostsController,
    PublicCategoriesController,
    PublicTagsController,
    AdminPostsController,
    AdminCategoriesController,
    AdminTagsController,
  ],
  providers: [PostsService, CategoriesService, TagsService],
  exports: [PostsService],
})
export class BlogModule {}
