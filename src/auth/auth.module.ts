import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Auth } from './entities/auth.entity';

@Module({
  controllers: [AuthController],
  imports: [TypeOrmModule.forFeature([Auth])],
  providers: [AuthService],
  exports: [TypeOrmModule],
})
export class AuthModule {}
