import { Controller, Get, Post, Put, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('api/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async createOrder(@Body() orderData: any) {
    try {
      const order = await this.ordersService.createOrder(orderData);
      return { success: true, data: order };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('user/:userId')
  async getOrdersByUser(@Param('userId') userId: number) {
    try {
      const orders = await this.ordersService.getOrdersByUser(userId);
      return { success: true, data: orders };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  async getAllOrders() {
    try {
      const orders = await this.ordersService.getAllOrders();
      return { success: true, data: orders };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':orderId')
  async getOrderById(@Param('orderId') orderId: number) {
    try {
      const order = await this.ordersService.getOrderById(orderId);
      return { success: true, data: order };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Put(':orderId/status')
  async updateOrderStatus(@Param('orderId') orderId: number, @Body() data: { status: string }) {
    try {
      const order = await this.ordersService.updateOrderStatus(orderId, data.status);
      return { success: true, data: order };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
