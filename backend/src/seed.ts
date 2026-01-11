import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';

async function seed() {
  console.log('🌱 Starting database seeding...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  try {
    // Create admin account
    const adminData = {
      email: 'admin@pedalhub.com',
      password: '@Admin123',
      firstName: 'Admin',
      lastName: 'Admin',
      isAdmin: true,
    };

    console.log('Creating admin account...');
    await usersService.register(adminData);
    console.log('✅ Admin account created successfully');
    console.log('   Email: admin@pedalhub.com');
    console.log('   Password: @Admin123');
    
  } catch (error) {
    if (error.message === 'Email already registered') {
      console.log('ℹ️  Admin account already exists');
    } else {
      console.error('❌ Error seeding database:', error.message);
    }
  }

  await app.close();
  console.log('✨ Database seeding completed!');
}

seed();
