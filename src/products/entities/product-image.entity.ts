import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '.';

@Entity()
export class ProductImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  url: string;

  @ManyToOne(
    () => Product, // TODO: retorna la clase con la que está relacionada
    (product) => product.images, // TODO: la instancia de la clase Product hace referencia al atributo (".images") para su relación inversa
    { onDelete: 'CASCADE' },
  )
  product: Product;
}
