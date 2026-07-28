import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { STORAGE_DRIVER, type StorageDriver } from './storage.interface';
import { LocalStorageDriver } from './drivers/local.driver';
import { S3StorageDriver } from './drivers/s3.driver';
import { StorageService } from './storage.service';

/**
 * Wires up the storage driver chosen by `STORAGE_DRIVER`. Global so any module
 * (media, applications) can inject {@link StorageService}.
 */
@Global()
@Module({
  providers: [
    {
      provide: STORAGE_DRIVER,
      inject: [ConfigService],
      useFactory: (config: ConfigService): StorageDriver => {
        const driver = config.get<'local' | 's3'>('storage.driver', 'local');
        if (driver === 's3') {
          const s3 = config.get('storage.s3')!;
          return new S3StorageDriver({
            endpoint: s3.endpoint,
            region: s3.region,
            bucket: s3.bucket,
            accessKeyId: s3.accessKeyId,
            secretAccessKey: s3.secretAccessKey,
            publicUrl: s3.publicUrl,
            forcePathStyle: s3.forcePathStyle,
          });
        }
        return new LocalStorageDriver(
          config.get<string>('storage.localPath', './uploads'),
          config.get<string>('storage.publicUrl', 'http://localhost:4000/uploads'),
        );
      },
    },
    StorageService,
  ],
  exports: [StorageService, STORAGE_DRIVER],
})
export class StorageModule {}
