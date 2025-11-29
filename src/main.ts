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
    const corsOrigin = configService.get<string>('CORS_ORIGIN');
    if (corsOrigin) {
      const allowedOrigins = corsOrigin.split(',');
      app.enableCors({
        origin: allowedOrigins,
        credentials: true,
      });
    } else {
      // CORS_ORIGIN이 설정되지 않은 경우 모든 origin 허용 (프로덕션에서는 권장하지 않음)
      app.enableCors({
        origin: true,
        credentials: true,
      });
    }

    // Railway는 PORT를 문자열로 제공할 수 있으므로 숫자로 변환
    // process.env.PORT를 우선적으로 사용 (Railway가 자동 설정)
    const port =
      Number(process.env.PORT) ||
      Number(configService.get<string>('PORT')) ||
      3001;

    await app.listen(port, '0.0.0.0');
    console.log(`Application is running on: http://0.0.0.0:${port}`);
    console.log(`PORT from env: ${process.env.PORT}`);
    console.log(
      `Environment: ${configService.get<string>('NODE_ENV', 'development')}`,
    );
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}
bootstrap();
