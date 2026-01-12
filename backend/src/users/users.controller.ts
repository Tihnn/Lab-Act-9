import { Controller, Post, Get, Put, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() userData: any) {
    try {
      const user = await this.usersService.register(userData);
      return { success: true, data: user };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with credentials' })
  async login(@Body() credentials: { email: string; password: string }) {
    try {
      const user = await this.usersService.login(credentials.email, credentials.password);
      return { success: true, data: user };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user profile' })
  async updateProfile(@Param('id') id: number, @Body() updateData: any) {
    try {
      const user = await this.usersService.updateProfile(id, updateData);
      return { success: true, data: user };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by id' })
  async getUser(@Param('id') id: number) {
    try {
      const user = await this.usersService.getUserById(id);
      return { success: true, data: user };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
}
