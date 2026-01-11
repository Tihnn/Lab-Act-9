import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderItem } from './order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
  ) {}

  async createOrder(orderData: any) {
    const order = this.orderRepository.create({
      userId: orderData.userId,
      customerName: orderData.customerName,
      email: orderData.email,
      phone: orderData.phone,
      address: orderData.address,
      city: orderData.city,
      country: orderData.country,
      totalAmount: orderData.totalAmount,
      paymentMethod: orderData.paymentMethod,
      status: 'pending',
    });

    const savedOrder = await this.orderRepository.save(order);

    // Create order items
    const orderItems = orderData.items.map((item: any) =>
      this.orderItemRepository.create({
        orderId: savedOrder.id,
        productId: item.productId,
        productType: item.productType,
        productName: item.productName,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl,
      }),
    );

    await this.orderItemRepository.save(orderItems);

    return await this.orderRepository.findOne({
      where: { id: savedOrder.id },
      relations: ['items'],
    });
  }

  async getOrdersByUser(userId: number) {
    return await this.orderRepository.find({
      where: { userId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAllOrders() {
    return await this.orderRepository.find({
      relations: ['items', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getOrderById(orderId: number) {
    return await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items'],
    });
  }

  async updateOrderStatus(orderId: number, status: string) {
    await this.orderRepository.update(orderId, { status });
    return await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items'],
    });
  }
}
