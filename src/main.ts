import * as crypto from 'crypto';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

// TypeORM이 crypto를 사용할 수 있도록 전역 설정
if (typeof global.crypto === 'undefined') {
  global.crypto = crypto as any;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api'); // 모든 라우트에 /api prefix 추가

  // CORS 설정
  const allowedOrigins = configService
    .get<string>('CORS_ORIGIN', 'http://localhost:3000')
    .split(',');
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  const port = configService.get<number>('PORT') || process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://0.0.0.0:${port}`);
}
bootstrap();
