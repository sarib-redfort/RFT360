import { CACHE_TAGS, type PaginatedResult } from '@rft360/shared';
import { apiGet, apiList } from './api';
import type {
  EventItem,
  FaqItem,
  GalleryAlbumItem,
  JobItem,
  PageDetail,
  PerkItem,
  PostItem,
  ServiceItem,
  StatItem,
  TeamMemberItem,
  TestimonialItem,
  ValueItem,
} from './content-types';

/** Fetch a static page's hero + body by slug. */
export function getPage(slug: string): Promise<PageDetail | null> {
  return apiGet<PageDetail>(`/pages/${slug}`, { tags: [CACHE_TAGS.pages] });
}

export function getValues(): Promise<ValueItem[]> {
  return listAll<ValueItem>('/culture-values', CACHE_TAGS.values);
}
export function getPerks(): Promise<PerkItem[]> {
  return listAll<PerkItem>('/perks', CACHE_TAGS.perks);
}
export function getTeam(): Promise<TeamMemberItem[]> {
  return listAll<TeamMemberItem>('/team', CACHE_TAGS.team);
}
export function getServices(): Promise<ServiceItem[]> {
  return listAll<ServiceItem>('/services', CACHE_TAGS.services);
}
export function getStatistics(): Promise<StatItem[]> {
  return listAll<StatItem>('/statistics', CACHE_TAGS.trust);
}
export function getTestimonials(): Promise<TestimonialItem[]> {
  return listAll<TestimonialItem>('/testimonials', CACHE_TAGS.testimonials);
}
export function getFaqs(): Promise<FaqItem[]> {
  return listAll<FaqItem>('/faqs', CACHE_TAGS.faqs);
}

export function getJobs(params?: Record<string, string>): Promise<PaginatedResult<JobItem>> {
  return apiList<JobItem>('/jobs', { tags: [CACHE_TAGS.jobs], params, revalidate: 300 });
}
export function getJob(slug: string): Promise<JobItem | null> {
  return apiGet<JobItem>(`/jobs/${slug}`, { tags: [CACHE_TAGS.jobs] });
}
export function getDepartments() {
  return listAll('/departments', CACHE_TAGS.jobs);
}

export function getEvents(): Promise<PaginatedResult<EventItem>> {
  return apiList<EventItem>('/events', { tags: [CACHE_TAGS.events], params: { limit: '50' } });
}
export function getEvent(slug: string): Promise<EventItem | null> {
  return apiGet<EventItem>(`/events/${slug}`, { tags: [CACHE_TAGS.events] });
}

export function getAlbums(): Promise<PaginatedResult<GalleryAlbumItem>> {
  return apiList<GalleryAlbumItem>('/gallery-albums', {
    tags: [CACHE_TAGS.gallery],
    params: { limit: '50' },
  });
}
export function getAlbum(slug: string): Promise<GalleryAlbumItem | null> {
  return apiGet<GalleryAlbumItem>(`/gallery-albums/${slug}`, { tags: [CACHE_TAGS.gallery] });
}

export function getPosts(params?: Record<string, string>): Promise<PaginatedResult<PostItem>> {
  return apiList<PostItem>('/posts', { tags: [CACHE_TAGS.posts], params });
}
export function getPost(slug: string): Promise<(PostItem & { related?: PostItem[] }) | null> {
  return apiGet<PostItem & { related?: PostItem[] }>(`/posts/${slug}`, { tags: [CACHE_TAGS.posts] });
}
export function getCategories() {
  return listAll('/post-categories', CACHE_TAGS.posts);
}

/** Helper: fetch a full ordered list endpoint and return just the array. */
async function listAll<T>(path: string, tag: string): Promise<T[]> {
  const result = await apiList<T>(path, { tags: [tag], params: { limit: '100' } });
  return result.data;
}
