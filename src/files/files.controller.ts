import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter, fileNamer } from './helpers';
import { diskStorage } from 'multer';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(
    private readonly configService: ConfigService,
    private readonly filesService: FilesService,
  ) {}

  @Get('product/:imageName')
  findProductImage(
    @Res() res: Response,
    @Param('imageName') imageName: string,
  ) {
    const path = this.filesService.getStaticProductImage(imageName);
    return res.sendFile(path);
  }

  @Post('product')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileFilter,
      storage: diskStorage({
        // * Guardar en FileSystem
        destination: './static/uploads',
        filename: fileNamer,
      }),
    }),
  )
  uploadedFile(@UploadedFile() file: Express.Multer.File) {
    if (!file)
      throw new BadRequestException(
        'Asegúrese de que el archivo sea una imagen',
      );
    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${file.filename}`;
    return {
      secureUrl,
    };
  }
}
