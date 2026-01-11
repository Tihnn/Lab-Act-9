import { Controller, Post, Get, Put, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body() userData: any) {
    try {
      const user = await this.usersService.register(userData);
      return { success: true, data: user };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('login')
  async login(@Body() credentials: { email: string; password: string }) {
    try {
      const user = await this.usersService.login(credentials.email, credentials.password);
      return { success: true, data: user };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
    }
  }

  @Put(':id')
  async updateProfile(@Param('id') id: number, @Body() updateData: any) {
    try {
      const user = await this.usersService.updateProfile(id, updateData);
      return { success: true, data: user };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':id')
  async getUser(@Param('id') id: number) {
    try {
      const user = await this.usersService.getUserById(id);
      return { success: true, data: user };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
}
