import { Auth } from '../entities/auth.entity';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtPayloadInterface } from '../interfaces/jwt-payload.interface';
import { PassportStrategy } from '@nestjs/passport';
import { Repository } from 'typeorm';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(Auth) private readonly authRepository: Repository<Auth>,
    configService: ConfigService,
  ) {
    super({
      secretOrKey: configService.get('JWT_SECRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }
  async validate(payload: JwtPayloadInterface): Promise<Auth> {
    const { id } = payload;
    const user = await this.authRepository.findOneBy({ id });
    if (!user) throw new UnauthorizedException(`Token inválido`);
    if (!user.isActive) throw new UnauthorizedException(`Usuario inactivo!`);
    return user;
  }
}
