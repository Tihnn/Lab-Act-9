import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
    rawBody: true,
  });
  
  // Enable CORS for frontend
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });
  
  // Increase body size limit for image uploads
  app.use((req, res, next) => {
    if (req.url.includes('/api/products') || req.url.includes('/api/orders')) {
      require('express').json({ limit: '50mb' })(req, res, next);
    } else {
      next();
    }
  });
  
  // Enable validation
  app.useGlobalPipes(new ValidationPipe());
  
  // Swagger API documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('PedalHub API')
    .setDescription('LABACT 9 - Bike Shop E-Commerce API Documentation\n\nComplete REST API for managing products, orders, cart, users, and notifications.')
    .setVersion('1.0.0')
    .addTag('Products', 'Product management endpoints (Bicycles, Parts, Accessories, Clothing)')
    .addTag('Cart', 'Shopping cart operations')
    .addTag('Orders', 'Order management and tracking')
    .addTag('Users', 'User authentication and profile management')
    .addTag('Status', 'Notification system')
    .addServer('http://localhost:3001', 'Development Server')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, swaggerDocument, {
    customSiteTitle: 'PedalHub API Docs',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: '.swagger-ui .topbar { display: none }',
  });
  
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Backend server is running on http://localhost:${port}`);
  console.log(`📚 Swagger API Documentation: http://localhost:${port}/api-docs`);
}
bootstrap();
