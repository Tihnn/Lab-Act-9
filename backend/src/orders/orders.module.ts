import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order, OrderItem } from './order.entity';
import { Bicycle, Part, Accessory, Clothing } from '../products/product.entity';
import { Status } from '../status/status.entity';
import { StatusService } from '../status/status.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Bicycle, Part, Accessory, Clothing, Status])],
  controllers: [OrdersController],
  providers: [OrdersService, StatusService],
})
export class OrdersModule {}
