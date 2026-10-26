import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Suggestion API')
      .setDescription('Documentación de la API de Suggestion')
      .setVersion('1.0.0')
      .addServer('http://localhost:4000', 'Desarrollo local')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT de autenticación',
        },
        'bearer',
      )
      .addTag('Dimensions', 'Gestión de dimensiones')
      .addTag('Questions', 'Gestión de preguntas')
      .addTag('Question Answers', 'Gestión de respuestas a preguntas')
      .addTag('Answers', 'Gestión de respuestas')
      .addTag('Answer Profiles', 'Gestión de perfiles de respuesta')
      .addTag('Evaluations', 'Gestión de evaluaciones')
      .build();
    const document = SwaggerModule.createDocument(app, config, {
      autoTagControllers: true,
      deepScanRoutes: true,
      operationIdFactory: (controller, method) => `${controller}_${method}`,
    });
    SwaggerModule.setup('api/docs', app, document, {
      jsonDocumentUrl: 'api/docs-json',
      swaggerOptions: { persistAuthorization: true },
    });
    Logger.log('Swagger UI disponible en: /api/docs', 'Swagger');
  }

  await app.listen(process.env.PORT ?? 3000);

  Logger.log(`Application is running on: ${await app.getUrl()}`, 'Bootstrap');
}
bootstrap();
