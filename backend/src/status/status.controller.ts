import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { StatusService } from './status.service';
import { Status } from './status.entity';

@Controller('api/status')
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Get()
  async findAll() {
    try {
      const statuses = await this.statusService.findAll();
      return {
        success: true,
        data: statuses,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string) {
    try {
      const statuses = await this.statusService.findByUserId(parseInt(userId));
      return {
        success: true,
        data: statuses,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Get('type/:userType')
  async findByUserType(@Param('userType') userType: string) {
    try {
      const statuses = await this.statusService.findByUserType(userType);
      return {
        success: true,
        data: statuses,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Get('unread/:userId')
  async getUnreadCount(@Param('userId') userId: string) {
    try {
      const count = await this.statusService.getUnreadCount(parseInt(userId));
      return {
        success: true,
        data: count,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Post()
  async create(@Body() statusData: Partial<Status>) {
    try {
      const status = await this.statusService.create(statusData);
      return {
        success: true,
        data: status,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Put(':id/read')
  async markAsRead(@Param('id') id: string) {
    try {
      const status = await this.statusService.markAsRead(parseInt(id));
      return {
        success: true,
        data: status,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
