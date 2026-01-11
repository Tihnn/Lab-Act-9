import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bicycle, Part, Accessory, Clothing } from './product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Bicycle)
    private bicycleRepository: Repository<Bicycle>,
    @InjectRepository(Part)
    private partRepository: Repository<Part>,
    @InjectRepository(Accessory)
    private accessoryRepository: Repository<Accessory>,
    @InjectRepository(Clothing)
    private clothingRepository: Repository<Clothing>,
  ) {}

  async getAllProducts() {
    const [bicycles, parts, accessories, clothing] = await Promise.all([
      this.bicycleRepository.find(),
      this.partRepository.find(),
      this.accessoryRepository.find(),
      this.clothingRepository.find(),
    ]);

    return {
      bicycles,
      parts,
      accessories,
      clothing,
    };
  }

  async createProduct(type: string, productData: any) {
    let repository;
    switch (type) {
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
        throw new Error('Invalid product type');
    }

    const product = repository.create(productData);
    return await repository.save(product);
  }

  async updateProduct(type: string, id: number, productData: any) {
    let repository;
    switch (type) {
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
        throw new Error('Invalid product type');
    }

    await repository.update(id, productData);
    return await repository.findOne({ where: { id } });
  }

  async deleteProduct(type: string, id: number) {
    let repository;
    switch (type) {
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
        throw new Error('Invalid product type');
    }

    await repository.delete(id);
    return { message: 'Product deleted successfully' };
  }

  async getProductById(type: string, id: number) {
    let repository;
    switch (type) {
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
        throw new Error('Invalid product type');
    }

    return await repository.findOne({ where: { id } });
  }
}
