import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createApp } from './config/create-app';
import { LoggingInterceptor } from './common/interceptor/interceptor';
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";

const port = process.env.PORT || 5000;

export async function bootstrap() {
  const rawApp = await NestFactory.create(AppModule);
  const app = createApp(rawApp);
  const config = new DocumentBuilder()
      .setTitle('Quiz-game')
      .setDescription('Documentation REST API')
      .setVersion('1.0.0')
      .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('/docs', app, document)

  app.useGlobalInterceptors(new LoggingInterceptor());
  await app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
}
bootstrap();
