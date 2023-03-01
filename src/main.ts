import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {createApp} from "./helpers/create-app";
import * as ngrok from "ngrok";
import {settings} from "./settings";

let port = process.env.PORT || 5000;

async function connectToNgrok() {
  const url = await ngrok.connect();
  return url;
};

async function sendHookToTelegram(url: string) {

}

async function bootstrap() {
  const rawApp = await NestFactory.create(AppModule);
  const app = createApp(rawApp);
  await app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });

  let baseUrl = settings.POSTGRES_URI
  if (settings.environment === 'dev') {
    baseUrl = await connectToNgrok()
  }
  await sendHookToTelegram(baseUrl)
}
bootstrap();
