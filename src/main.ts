import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createApp } from './config/create-app';
import { LoggingInterceptor } from './common/interceptor/interceptor';

const port = process.env.PORT || 5000;

export async function bootstrap() {
  const rawApp = await NestFactory.create(AppModule);
  const app = createApp(rawApp);
  app.useGlobalInterceptors(new LoggingInterceptor());
  await app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
}
bootstrap();
