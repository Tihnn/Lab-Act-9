import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Bicycle, Part, Accessory, Clothing } from './product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bicycle, Part, Accessory, Clothing])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
