import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductImage } from '.';
import { Auth } from 'src/auth/entities/auth.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'products' })
export class Product {
  @ApiProperty()
  /*
    //TODO: Expansión de ApiProperty
    {
      example: "Valor de ejemplo",
      descripcion: "Descripción",
      uniqueItems: true, //! Valores únicos (Opcional)
      default: "valor por defecto" //! Valor por defecto (Opcional)
    } 
    */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('text', {
    unique: true,
  })
  title: string;

  @ApiProperty()
  @Column('float', {
    default: 0,
  })
  price: number;

  @ApiProperty()
  @Column('text', {
    // type: 'text',
    nullable: true,
  })
  description: string;

  @ApiProperty()
  @Column('text', {
    unique: true,
  })
  slug: string;

  @ApiProperty()
  @Column('integer', {
    default: 0,
  })
  stock: number;

  @ApiProperty()
  @Column('text', {
    array: true,
  })
  sizes: string[];

  @ApiProperty()
  @Column('text')
  gender: string;

  // tags
  @ApiProperty()
  @Column('text', {
    array: true,
    default: [],
  })
  tags: string[];

  @ApiProperty()
  @OneToMany(
    () => ProductImage, // TODO: retorna la clase con la que está relacionada
    (productImage) => productImage.product, // TODO: la instancia de la clase ProductImage hace referencia al atributo (".product") de product-image.entity.ts para definir la relación inversa
    { cascade: true, eager: true }, // Eliminación en cascada - tabla independiente
  )
  images?: ProductImage[];

  @ManyToOne(() => Auth, (user) => user.product, { eager: true })
  user: Auth;

  @BeforeInsert()
  chekcSlugInsert() {
    if (!this.slug) {
      this.slug = this.title
        .toLowerCase()
        .replaceAll(' ', '_')
        .replaceAll("'", '');
    } else {
      this.slug = this.slug
        .toLowerCase()
        .replaceAll(' ', '_')
        .replaceAll("'", '');
    }
  }

  @BeforeUpdate()
  checkSlugUpdate() {
    this.slug = this.slug
      .toLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '');
  }
}
