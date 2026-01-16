import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderItem } from './order.entity';
import { Bicycle, Part, Accessory, Clothing } from '../products/product.entity';
import { StatusService } from '../status/status.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Bicycle)
    private bicycleRepository: Repository<Bicycle>,
    @InjectRepository(Part)
    private partRepository: Repository<Part>,
    @InjectRepository(Accessory)
    private accessoryRepository: Repository<Accessory>,
    @InjectRepository(Clothing)
    private clothingRepository: Repository<Clothing>,
    private statusService: StatusService,
  ) {}

  async createOrder(orderData: any) {
    const order = this.orderRepository.create({
      userId: orderData.userId,
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      customerPhone: orderData.customerPhone,
      shippingAddress: orderData.shippingAddress,
      postalCode: orderData.postalCode,
      totalAmount: orderData.totalAmount,
      paymentMethod: orderData.paymentMethod || 'Cash on Delivery',
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

    // Create notification for admin when user places order
    await this.statusService.create({
      userId: 1, // Admin user ID (assuming admin has ID 1)
      userType: 'admin',
      action: 'order_placed',
      description: `New order #${savedOrder.id} placed by ${orderData.customerName}`,
      isRead: false,
    });

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
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items', 'user'],
    });

    const previousStatus = order.status;

    // If changing status to ship, reduce stock
    if (status === 'ship' && order.status !== 'ship') {
      for (const item of order.items) {
        let repository;
        switch (item.productType) {
          case 'bicycle':
            repository = this.bicycleRepository;
            break;
          case 'part':
            repository = this.partRepository;
            break;
          case 'accessory':
            repository = this.accessoryRepository;
            break;
          case 'clothing':
            repository = this.clothingRepository;
            break;
          default:
            continue;
        }

        const product = await repository.findOne({ where: { id: item.productId } });
        if (product && product.stock >= item.quantity) {
          product.stock -= item.quantity;
          await repository.save(product);
        }
      }
    }

    await this.orderRepository.update(orderId, { status });

    // Create notifications based on status changes
    if (status === 'cancelled' && previousStatus === 'pending') {
      // User requested cancellation - notify admin
      await this.statusService.create({
        userId: 1, // Admin user ID
        userType: 'admin',
        action: 'order_cancel_request',
        description: `Order #${orderId} cancellation requested`,
        isRead: false,
      });

      // Also notify user that order was cancelled
      if (order.userId) {
        await this.statusService.create({
          userId: order.userId,
          userType: 'user',
          action: 'order_cancelled',
          description: `Your order #${orderId} has been cancelled`,
          isRead: false,
        });
      }
    }

    if (status === 'delivered' && previousStatus === 'ship') {
      // User marked order as received - notify admin
      await this.statusService.create({
        userId: 1, // Admin user ID
        userType: 'admin',
        action: 'order_received',
        description: `Order #${orderId} marked as received by customer`,
        isRead: false,
      });
    }

    if (status === 'ship' && previousStatus === 'pending') {
      // Admin shipped order - notify user
      if (order.userId) {
        await this.statusService.create({
          userId: order.userId,
          userType: 'user',
          action: 'order_shipped',
          description: `Your order #${orderId} has been shipped`,
          isRead: false,
        });
      }
    }

    if (status === 'cancelled' && previousStatus !== 'pending') {
      // Admin cancelled order - notify user
      if (order.userId) {
        await this.statusService.create({
          userId: order.userId,
          userType: 'user',
          action: 'order_cancelled',
          description: `Your order #${orderId} has been cancelled by admin`,
          isRead: false,
        });
      }
    }

    return await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items'],
    });
  }

  async deleteOrder(orderId: number) {
    // First delete order items
    await this.orderItemRepository.delete({ orderId });
    // Then delete the order
    await this.orderRepository.delete(orderId);
  }

  async requestCancellation(orderId: number, reason?: string) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['user'],
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Update order to mark cancellation requested with reason
    await this.orderRepository.update(orderId, { 
      cancellationRequested: true,
      cancellationReason: reason || 'No reason provided'
    });

    // Notify admin about cancellation request
    await this.statusService.create({
      userId: 1, // Admin user ID
      userType: 'admin',
      action: 'order_cancel_request',
      description: `Order #${orderId} cancellation requested by ${order.customerName}`,
      isRead: false,
    });

    return await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items'],
    });
  }

  async confirmCancellation(orderId: number) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items', 'user'],
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Return stock if order was shipped (stock was reduced when status changed to ship)
    if (order.status === 'ship' || order.status === 'delivered') {
      for (const item of order.items) {
        let repository;
        switch (item.productType.toLowerCase()) {
          case 'bicycle':
            repository = this.bicycleRepository;
            break;
          case 'part':
            repository = this.partRepository;
            break;
          case 'accessory':
            repository = this.accessoryRepository;
            break;
          case 'clothing':
            repository = this.clothingRepository;
            break;
          default:
            console.error(`Unknown product type: ${item.productType}`);
            continue;
        }

        const product = await repository.findOne({ where: { id: item.productId } });
        if (product) {
          console.log(`Returning stock for ${item.productName}: ${item.quantity} units`);
          product.stock += item.quantity;
          await repository.save(product);
        } else {
          console.error(`Product not found: ${item.productId} of type ${item.productType}`);
        }
      }
    }

    // Update order status to cancelled and reset cancellation request flag
    await this.orderRepository.update(orderId, { 
      status: 'cancelled',
      cancellationRequested: false 
    });

    // Notify user that cancellation was confirmed
    if (order.userId) {
      await this.statusService.create({
        userId: order.userId,
        userType: 'user',
        action: 'cancellation_confirmed',
        description: `Your order #${orderId} cancellation has been confirmed`,
        isRead: false,
      });
    }

    return await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items'],
    });
  }
}
