import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProductsService } from './products.service';

@ApiTags('Products')
@Controller('api/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  async getAllProducts() {
    try {
      const products = await this.productsService.getAllProducts();
      return { success: true, data: products };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post(':type')
  @ApiOperation({ summary: 'Create a product by type' })
  async createProduct(@Param('type') type: string, @Body() productData: any) {
    try {
      const product = await this.productsService.createProduct(type, productData);
      return { success: true, data: product };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Put(':type/:id')
  @ApiOperation({ summary: 'Update a product by type and id' })
  async updateProduct(
    @Param('type') type: string,
    @Param('id') id: number,
    @Body() productData: any,
  ) {
    try {
      const product = await this.productsService.updateProduct(type, id, productData);
      return { success: true, data: product };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':type/:id')
  @ApiOperation({ summary: 'Delete a product by type and id' })
  async deleteProduct(@Param('type') type: string, @Param('id') id: number) {
    try {
      const result = await this.productsService.deleteProduct(type, id);
      return { success: true, data: result };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':type/:id')
  @ApiOperation({ summary: 'Get a product by type and id' })
  async getProductById(@Param('type') type: string, @Param('id') id: number) {
    try {
      const product = await this.productsService.getProductById(type, id);
      return { success: true, data: product };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
}
