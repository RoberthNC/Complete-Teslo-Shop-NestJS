import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationDto {
  @ApiProperty({
    default: 10,
  })
  @IsPositive()
  @IsOptional()
  @Type(() => Number) // ... transform: true, transformOptions: { enableImplicitConversions: true }
  limit?: number;

  @ApiProperty({
    default: 10,
  })
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  offset?: number;
}
