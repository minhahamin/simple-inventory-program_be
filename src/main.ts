import * as crypto from 'crypto';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

// TypeORM이 crypto를 사용할 수 있도록 전역 설정
if (typeof global.crypto === 'undefined') {
  global.crypto = crypto as any;
}

async function bootstrap() {
  try {
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

    // Railway는 PORT를 문자열로 제공할 수 있으므로 숫자로 변환
    const port =
      Number(configService.get<string>('PORT')) ||
      Number(process.env.PORT) ||
      3001;

    await app.listen(port, '0.0.0.0');
    console.log(`Application is running on: http://0.0.0.0:${port}`);
    console.log(
      `Environment: ${configService.get<string>('NODE_ENV', 'development')}`,
    );
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}
bootstrap();
