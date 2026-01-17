import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import config from './core/config/environment';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger("Main");
  const app = await NestFactory.create(AppModule, {
    logger: ["error", "warn", "log"],
    bodyParser: true
  });

  // Configurar class-validator para usar el contenedor de NestJS
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.setGlobalPrefix("api");

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );

  // CORS habilitado sin restricciones de origen
  app.enableCors({
    origin: true, // Permite cualquier origen
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true
  });

  const configDocument = new DocumentBuilder()
    .setTitle("Ag360 Billing Documentation")
    .setDescription("Ag360 Billing API documentation for the backend")
    .setVersion("1.5")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, configDocument);
  SwaggerModule.setup("api", app, document);

  await app.listen(config.port, () => {
    console.log(`BILLING ESTÁ ESCUCHANDO EL PUERTO ${config.port} CORRECTAMENTE`);
  });
}

bootstrap();
