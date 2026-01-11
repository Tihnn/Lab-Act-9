import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './cart.entity';
import { ProductsService } from '../products/products.service';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private cartRepository: Repository<CartItem>,
    private productsService: ProductsService,
  ) {}

  async addToCart(userId: number, productType: string, productId: number, quantity: number) {
    const product = await this.productsService.getProductById(productType, productId);

    if (!product) {
      throw new Error('Product not found');
    }

    const existingItem = await this.cartRepository.findOne({
      where: { userId, productId, productType },
    });

    if (existingItem) {
      existingItem.quantity += quantity;
      return await this.cartRepository.save(existingItem);
    }

    const cartItem = this.cartRepository.create({
      userId,
      productId,
      productType,
      productName: product.name,
      price: product.price,
      quantity,
      imageUrl: product.imageUrl,
    });

    return await this.cartRepository.save(cartItem);
  }

  async getCart(userId: number) {
    return await this.cartRepository.find({ where: { userId } });
  }

  async updateCartItem(cartItemId: number, quantity: number) {
    await this.cartRepository.update(cartItemId, { quantity });
    return await this.cartRepository.findOne({ where: { id: cartItemId } });
  }

  async removeFromCart(cartItemId: number) {
    await this.cartRepository.delete(cartItemId);
    return { message: 'Item removed from cart' };
  }

  async clearCart(userId: number) {
    await this.cartRepository.delete({ userId });
    return { message: 'Cart cleared' };
  }
}
