import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ClassSerializerInterceptor } from '@nestjs/common';

async function bootstrap() {
  
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  
  // app.enableCors({
  //  origin: 'http://localhost:3001', 
  //  credentials: true, 
  //  });

    app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector))
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
