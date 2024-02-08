import { existsSync } from 'fs';
import { join } from 'path';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class FilesService {
  getStaticProductImage(imageName: string) {
    const path = join(__dirname, '../../static/uploads', imageName);
    if (!existsSync(path))
      throw new BadRequestException(
        `El producto con el nombre de la imagen ${imageName} no existe`,
      );
    return path;
  }
}
