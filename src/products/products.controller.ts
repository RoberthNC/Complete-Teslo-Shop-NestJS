import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { AuthDecorator } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Auth } from '../auth/entities/auth.entity';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Product } from './entities';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @AuthDecorator()
  @ApiResponse({
    status: 201,
    description: 'El producto fue creado',
    type: Product,
  })
  @ApiResponse({ status: 400, description: 'Error de petición' })
  @ApiResponse({ status: 403, description: 'El token no es válido' })
  create(@Body() createProductDto: CreateProductDto, @GetUser() user: Auth) {
    return this.productsService.create(createProductDto, user);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.productsService.findAll(paginationDto);
  }

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.productsService.findOnePlain(term);
  }

  @Patch(':id')
  @AuthDecorator(ValidRoles.user)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
    @GetUser() user: Auth,
  ) {
    return this.productsService.update(id, updateProductDto, user);
  }

  @Delete(':id')
  @AuthDecorator(ValidRoles.user)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
