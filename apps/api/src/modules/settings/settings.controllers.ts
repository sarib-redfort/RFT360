import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  navigationItemSchema,
  NavLocation,
  reorderSchema,
  Role,
  updateNavigationItemSchema,
  updateSiteSettingsSchema,
} from '@rft360/shared';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { SettingsService } from './settings.service';

@ApiTags('Public · Settings')
@Controller('settings')
export class PublicSettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Public site settings (branding, contact, socials)' })
  get() {
    return this.settings.get();
  }

  @Public()
  @Get('navigation/:location')
  @ApiOperation({ summary: 'Published navigation tree for a location' })
  navigation(@Param('location') location: string) {
    const loc = (location.toUpperCase() as NavLocation) ?? NavLocation.HEADER;
    return this.settings.getNavigation(loc, true);
  }
}

@ApiTags('Admin · Settings')
@Controller('admin/settings')
@Roles(Role.ADMIN)
export class AdminSettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get full site settings' })
  get() {
    return this.settings.get();
  }

  @Patch()
  @ApiOperation({ summary: 'Update site settings' })
  update(@Body() body: unknown) {
    return this.settings.update(updateSiteSettingsSchema.parse(body));
  }
}

@ApiTags('Admin · Navigation')
@Controller('admin/navigation')
@Roles(Role.EDITOR)
export class AdminNavigationController {
  constructor(private readonly settings: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'List all navigation items' })
  list(@Query('location') location?: string) {
    if (location) {
      return this.settings.getNavigation(location.toUpperCase() as NavLocation, false);
    }
    return this.settings.listNavigation();
  }

  @Post()
  @ApiOperation({ summary: 'Create a navigation item' })
  create(@Body() body: unknown) {
    return this.settings.createNavItem(navigationItemSchema.parse(body));
  }

  @Post('reorder')
  @ApiOperation({ summary: 'Reorder navigation items' })
  reorder(@Body() body: unknown) {
    return this.settings.reorderNav(reorderSchema.parse(body).items);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a navigation item' })
  update(@Param('id') id: string, @Body() body: unknown) {
    return this.settings.updateNavItem(id, updateNavigationItemSchema.parse(body));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a navigation item' })
  remove(@Param('id') id: string) {
    return this.settings.removeNavItem(id);
  }
}
