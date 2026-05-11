import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => ({
        secret: configService.get<string>(
          'JWT_SECRET',
          'smartstock-secret-key',
        ),
        signOptions: {
          expiresIn: configService.get<string>(
            'JWT_EXPIRATION',
            '1d',
          ) as `${number}${'s' | 'm' | 'h' | 'd'}`,
        },
      }),
    }),
  ],
  exports: [JwtModule],
})
export class SharedJwtModule {}
