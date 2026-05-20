import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { PORT, ALLOWED_ORIGIN } from "./common/env";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ALLOWED_ORIGIN,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  });

  await app.listen(PORT);
  console.log(`Running on http://localhost:${PORT}`);
}

bootstrap();
