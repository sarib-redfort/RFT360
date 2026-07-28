import { Module } from '@nestjs/common';
import { MediaModule } from '../media/media.module';
import { JobsService, DepartmentsService } from './jobs.service';
import { ApplicationsService } from './applications.service';
import {
  AdminApplicationsController,
  AdminDepartmentsController,
  AdminJobsController,
  PublicApplicationsController,
  PublicDepartmentsController,
  PublicJobsController,
} from './careers.controllers';

@Module({
  imports: [MediaModule],
  controllers: [
    PublicJobsController,
    PublicDepartmentsController,
    PublicApplicationsController,
    AdminJobsController,
    AdminDepartmentsController,
    AdminApplicationsController,
  ],
  providers: [JobsService, DepartmentsService, ApplicationsService],
  exports: [JobsService],
})
export class CareersModule {}
