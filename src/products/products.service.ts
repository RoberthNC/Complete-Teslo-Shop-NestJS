import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}
  async create(createProductDto: CreateProductDto) {
    try {
      const product = this.productRepository.create(createProductDto); // Lo graba en memoria
      await this.productRepository.save(product); // Lo graba en la base de datos
      return product;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  //TODO: paginar
  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    return this.productRepository.find({
      take: limit,
      skip: offset,
      //TODO: relaciones
    });
  }

  async findOne(term: string) {
    let product: Product;
    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      const query = this.productRepository.createQueryBuilder();
      product = await query
        .where('UPPER(title) =:title or slug =:slug ', {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        .getOne();
    }
    if (!product)
      throw new NotFoundException(`El producto con el id: ${term} no existe`);
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    // Busca un producto por su id y setea los valores que vienen en el dto
    const product = await this.productRepository.preload({
      id,
      ...updateProductDto,
    });
    if (!product)
      throw new NotFoundException(
        `El producto con el id: ${id} no fue encontrado`,
      );
    try {
      await this.productRepository.save(product); // Se guarda la actualización en la base de datos
      return product;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
    return 'Producto eliminado correctamente';
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Error inesperado. Revise las salidas en la consola',
    );
  }
}
