import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [FilesController],
  providers: [ConfigService, FilesService],
})
export class FilesModule {}
