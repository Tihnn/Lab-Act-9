import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Status } from './status.entity';

@Injectable()
export class StatusService {
  constructor(
    @InjectRepository(Status)
    private statusRepository: Repository<Status>,
  ) {}

  async create(statusData: Partial<Status>): Promise<Status> {
    const status = this.statusRepository.create(statusData);
    return await this.statusRepository.save(status);
  }

  async findAll(): Promise<Status[]> {
    return await this.statusRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findByUserId(userId: number): Promise<Status[]> {
    return await this.statusRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByUserType(userType: string): Promise<Status[]> {
    return await this.statusRepository.find({
      where: { userType },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(id: number): Promise<Status> {
    const status = await this.statusRepository.findOne({ where: { id } });
    if (status) {
      status.isRead = true;
      return await this.statusRepository.save(status);
    }
    return null;
  }

  async getUnreadCount(userId: number): Promise<number> {
    return await this.statusRepository.count({
      where: { userId, isRead: false },
    });
  }
}
