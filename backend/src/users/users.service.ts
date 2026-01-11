import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async register(userData: any) {
    const existingUser = await this.userRepository.findOne({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const userEntity: any = this.userRepository.create({
      ...userData,
      password: hashedPassword,
    });

    await this.userRepository.save(userEntity);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = userEntity;
    return result;
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async updateProfile(userId: number, updateData: any) {
    await this.userRepository.update(userId, updateData);
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }
    const { password, ...result } = user;
    return result;
  }

  async getUserById(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }
    const { password, ...result } = user;
    return result;
  }
}
