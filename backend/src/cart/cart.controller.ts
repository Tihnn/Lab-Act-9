import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { CartService } from './cart.service';

@Controller('api/cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('add')
  async addToCart(
    @Body() cartData: { userId: number; productType: string; productId: number; quantity: number },
  ) {
    try {
      const cartItem = await this.cartService.addToCart(
        cartData.userId,
        cartData.productType,
        cartData.productId,
        cartData.quantity,
      );
      return { success: true, data: cartItem };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':userId')
  async getCart(@Param('userId') userId: number) {
    try {
      const cart = await this.cartService.getCart(userId);
      return { success: true, data: cart };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':cartItemId')
  async updateCartItem(@Param('cartItemId') cartItemId: number, @Body() data: { quantity: number }) {
    try {
      const cartItem = await this.cartService.updateCartItem(cartItemId, data.quantity);
      return { success: true, data: cartItem };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':cartItemId')
  async removeFromCart(@Param('cartItemId') cartItemId: number) {
    try {
      const result = await this.cartService.removeFromCart(cartItemId);
      return { success: true, data: result };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('clear/:userId')
  async clearCart(@Param('userId') userId: number) {
    try {
      const result = await this.cartService.clearCart(userId);
      return { success: true, data: result };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
