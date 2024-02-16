import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto, UpdateProductDto } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';
import { Product, ProductImage } from './entities';
import { Auth } from 'src/auth/entities/auth.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    private readonly dataSource: DataSource, // Tiene la misma configuración que la bd
  ) {}
  async create(createProductDto: CreateProductDto, user: Auth) {
    try {
      const { images = [], ...productDetails } = createProductDto;
      const product = this.productRepository.create({
        ...productDetails,
        images: images.map((image) =>
          this.productImageRepository.create({ url: image }),
        ),
        user,
      }); // Lo graba en memoria
      await this.productRepository.save(product); // Lo graba en la base de datos
      return { ...product, images };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  //TODO: paginar
  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      //TODO: relaciones
      relations: {
        images: true,
      },
    });
    return products.map(({ images, ...rest }) => ({
      ...rest,
      images: images.map((img) => img.url),
    }));
  }

  async findOne(term: string) {
    let product: Product;
    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      const query = this.productRepository.createQueryBuilder('prod'); // *prod* es el alias de la tabla de Producto
      product = await query
        .where('UPPER(title) =:title or slug =:slug ', {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne();
    }
    if (!product)
      throw new NotFoundException(`El producto con el id: ${term} no existe`);
    return product;
  }

  async findOnePlain(term: string) {
    const { images, ...rest } = await this.findOne(term);
    return {
      ...rest,
      images: images.map((img) => img.url),
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: Auth) {
    const { images, ...toUpdate } = updateProductDto;
    // Busca un producto por su id y setea los valores que vienen en el dto
    const product = await this.productRepository.preload({
      id,
      ...toUpdate,
    });
    if (!product)
      throw new NotFoundException(
        `El producto con el id: ${id} no fue encontrado`,
      );
    // Create query runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect(); // Conectarse a la BD
    await queryRunner.startTransaction(); // Iniciar la transacción
    try {
      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: { id } }); // columna de product
        product.images = images.map((img) =>
          this.productImageRepository.create({ url: img }),
        );
      }
      product.user = user;
      await queryRunner.manager.save(product); // *INTENTA* grabar en la base de datos cuando usamos el *manager*
      // await this.productRepository.save(product); // Se guarda la actualización en la base de datos
      await queryRunner.commitTransaction(); // Ejecuta la transacción guardando en la base de datos
      await queryRunner.release(); // El query runner deja de funcionar
      return this.findOnePlain(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
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

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');
    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }
}
