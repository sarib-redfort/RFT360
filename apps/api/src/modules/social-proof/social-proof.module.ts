import { Controller, Get, Injectable, Module } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { listQuerySchema } from '@rft360/shared';
import { Public } from '../../common/decorators/public.decorator';
import {
  CACHE_TAGS,
  caseStudySchema,
  faqSchema,
  Role,
  testimonialSchema,
  updateCaseStudySchema,
  updateFaqSchema,
  updateTestimonialSchema,
} from '@rft360/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { RevalidationService } from '../revalidation/revalidation.service';
import { PublishableCrudService } from '../../common/services/publishable-crud.service';
import { AbstractAdminCrudController } from '../../common/controllers/abstract-admin-crud.controller';
import { AbstractPublicCrudController } from '../../common/controllers/abstract-public-crud.controller';
import { Roles } from '../../common/decorators/roles.decorator';
import { caseStudyInclude, coverOnlyInclude } from '../../common/prisma-includes';
import { mapRichText } from '../../common/utils/rich-text';

// ── Testimonials ────────────────────────────────────────────────────────────

@Injectable()
export class TestimonialsService extends PublishableCrudService {
  constructor(prisma: PrismaService, redis: RedisService, revalidation: RevalidationService) {
    super(prisma, redis, revalidation, {
      model: 'testimonial',
      cacheTag: CACHE_TAGS.testimonials,
      searchFields: ['authorName', 'authorRole', 'quote'],
      include: { avatar: coverOnlyInclude.coverImage },
      extraRevalidateTags: [CACHE_TAGS.homepage],
      defaultSort: { field: 'order', order: 'asc' },
    });
  }
}

// ── FAQs ─────────────────────────────────────────────────────────────────────

@Injectable()
export class FaqsService extends PublishableCrudService {
  constructor(prisma: PrismaService, redis: RedisService, revalidation: RevalidationService) {
    super(prisma, redis, revalidation, {
      model: 'faq',
      cacheTag: CACHE_TAGS.faqs,
      searchFields: ['question', 'answer', 'category'],
      extraRevalidateTags: [CACHE_TAGS.homepage],
      defaultSort: { field: 'order', order: 'asc' },
    });
  }
}

// ── Case studies ───────────────────────────────────────────────────────────

@Injectable()
export class CaseStudiesService extends PublishableCrudService {
  constructor(prisma: PrismaService, redis: RedisService, revalidation: RevalidationService) {
    super(prisma, redis, revalidation, {
      model: 'caseStudy',
      cacheTag: CACHE_TAGS.caseStudies,
      slugSource: 'title',
      searchFields: ['title', 'subtitle', 'summary', 'clientName'],
      include: caseStudyInclude,
      extraRevalidateTags: [CACHE_TAGS.homepage],
      defaultSort: { field: 'order', order: 'asc' },
    });
  }
  protected override toCreateData(input: Record<string, unknown>) {
    return mapRichText(input, 'content');
  }
  protected override toUpdateData(input: Record<string, unknown>) {
    return mapRichText(input, 'content');
  }
}

// ── Controllers ──────────────────────────────────────────────────────────────

@ApiTags('Public · Testimonials')
@Controller('testimonials')
export class PublicTestimonialsController {
  constructor(private readonly service: TestimonialsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List published testimonials' })
  list() {
    return this.service.publicList(listQuerySchema.parse({ limit: 50, sortBy: 'order', sortOrder: 'asc' }));
  }
}

@ApiTags('Admin · Testimonials')
@Controller('admin/testimonials')
@Roles(Role.EDITOR)
export class AdminTestimonialsController extends AbstractAdminCrudController {
  protected readonly createSchema = testimonialSchema;
  protected readonly updateSchema = updateTestimonialSchema;
  constructor(protected readonly service: TestimonialsService) {
    super();
  }
}

@ApiTags('Public · FAQs')
@Controller('faqs')
export class PublicFaqsController {
  constructor(private readonly service: FaqsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List published FAQs' })
  list() {
    return this.service.publicList(listQuerySchema.parse({ limit: 100, sortBy: 'order', sortOrder: 'asc' }));
  }
}

@ApiTags('Admin · FAQs')
@Controller('admin/faqs')
@Roles(Role.EDITOR)
export class AdminFaqsController extends AbstractAdminCrudController {
  protected readonly createSchema = faqSchema;
  protected readonly updateSchema = updateFaqSchema;
  constructor(protected readonly service: FaqsService) {
    super();
  }
}

@ApiTags('Public · Case Studies')
@Controller('case-studies')
export class PublicCaseStudiesController extends AbstractPublicCrudController {
  constructor(protected readonly service: CaseStudiesService) {
    super();
  }
}

@ApiTags('Admin · Case Studies')
@Controller('admin/case-studies')
@Roles(Role.EDITOR)
export class AdminCaseStudiesController extends AbstractAdminCrudController {
  protected readonly createSchema = caseStudySchema;
  protected readonly updateSchema = updateCaseStudySchema;
  constructor(protected readonly service: CaseStudiesService) {
    super();
  }
}

@Module({
  controllers: [
    PublicTestimonialsController,
    AdminTestimonialsController,
    PublicFaqsController,
    AdminFaqsController,
    PublicCaseStudiesController,
    AdminCaseStudiesController,
  ],
  providers: [TestimonialsService, FaqsService, CaseStudiesService],
  exports: [TestimonialsService, FaqsService, CaseStudiesService],
})
export class SocialProofModule {}
