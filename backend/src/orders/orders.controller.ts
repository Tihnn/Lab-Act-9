import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OrdersService } from './orders.service';

@ApiTags('Orders')
@Controller('api/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create an order' })
  async createOrder(@Body() orderData: any) {
    try {
      const order = await this.ordersService.createOrder(orderData);
      return { success: true, data: order };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get orders by user' })
  async getOrdersByUser(@Param('userId') userId: number) {
    try {
      const orders = await this.ordersService.getOrdersByUser(userId);
      return { success: true, data: orders };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders' })
  async getAllOrders() {
    try {
      const orders = await this.ordersService.getAllOrders();
      return { success: true, data: orders };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':orderId')
  @ApiOperation({ summary: 'Get order by id' })
  async getOrderById(@Param('orderId') orderId: number) {
    try {
      const order = await this.ordersService.getOrderById(orderId);
      return { success: true, data: order };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Put(':orderId/status')
  @ApiOperation({ summary: 'Update order status' })
  async updateOrderStatus(@Param('orderId') orderId: number, @Body() data: { status: string }) {
    try {
      const order = await this.ordersService.updateOrderStatus(orderId, data.status);
      return { success: true, data: order };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':orderId')
  @ApiOperation({ summary: 'Delete order by id' })
  async deleteOrder(@Param('orderId') orderId: number) {
    try {
      await this.ordersService.deleteOrder(orderId);
      return { success: true, message: 'Order deleted successfully' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
