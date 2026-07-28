import { Injectable } from '@nestjs/common';
import {
  CACHE_TAGS,
  ContentStatus,
  NavLocation,
  type NavigationItemInput,
  type UpdateSiteSettingsInput,
} from '@rft360/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { RevalidationService } from '../revalidation/revalidation.service';
import { mediaSelect } from '../../common/prisma-includes';

type UpdateSiteSettingsInputType = UpdateSiteSettingsInput;

/**
 * Global site settings (a single row) plus the navigation builder.
 *
 * The settings row is created lazily on first read and only ever updated, so
 * there is always exactly one. Both settings and navigation revalidate their
 * respective cache tags (which appear on every page) on change.
 */
@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly revalidation: RevalidationService,
  ) {}

  /** Returns the settings row, creating a default one if none exists. */
  async get() {
    const existing = await this.prisma.siteSettings.findFirst({
      include: {
        logoLight: mediaSelect,
        logoDark: mediaSelect,
        favicon: mediaSelect,
        defaultOgImage: mediaSelect,
      },
    });
    if (existing) return existing;
    return this.prisma.siteSettings.create({ data: {} });
  }

  async update(input: UpdateSiteSettingsInputType) {
    const current = await this.get();
    const updated = await this.prisma.siteSettings.update({
      where: { id: current.id },
      data: input,
      include: {
        logoLight: mediaSelect,
        logoDark: mediaSelect,
        favicon: mediaSelect,
        defaultOgImage: mediaSelect,
      },
    });
    await this.revalidation.revalidate([CACHE_TAGS.settings]);
    return updated;
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  /** Returns nav items for one location as a parent/child tree. */
  async getNavigation(location: NavLocation, publishedOnly = false) {
    const items = await this.prisma.navigationItem.findMany({
      where: {
        location,
        parentId: null,
        ...(publishedOnly ? { status: ContentStatus.PUBLISHED } : {}),
      },
      include: {
        children: {
          where: publishedOnly ? { status: ContentStatus.PUBLISHED } : {},
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });
    return items;
  }

  /** All nav items flat (admin builder view). */
  listNavigation() {
    return this.prisma.navigationItem.findMany({ orderBy: [{ location: 'asc' }, { order: 'asc' }] });
  }

  async createNavItem(input: NavigationItemInput) {
    const item = await this.prisma.navigationItem.create({ data: input as never });
    await this.revalidation.revalidate([CACHE_TAGS.navigation]);
    return item;
  }

  async updateNavItem(id: string, input: Partial<NavigationItemInput>) {
    const item = await this.prisma.navigationItem.update({ where: { id }, data: input as never });
    await this.revalidation.revalidate([CACHE_TAGS.navigation]);
    return item;
  }

  async removeNavItem(id: string) {
    await this.prisma.navigationItem.delete({ where: { id } });
    await this.revalidation.revalidate([CACHE_TAGS.navigation]);
    return { id };
  }

  async reorderNav(items: { id: string; order: number }[]) {
    await this.prisma.$transaction(
      items.map((item) =>
        this.prisma.navigationItem.update({ where: { id: item.id }, data: { order: item.order } }),
      ),
    );
    await this.revalidation.revalidate([CACHE_TAGS.navigation]);
    return { success: true };
  }
}
