import { getRepository, Repository, In } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const createProduct = await this.ormRepository.create({
      name,
      price,
      quantity,
    });

    const product = await this.ormRepository.save(createProduct);

    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const findProductByName = await this.ormRepository.findOne({
      where: { name },
    });

    return findProductByName;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    const productsId = products.map(product => product.id);

    const findAllProductsById = await this.ormRepository.find({
      where: { id: In(productsId) },
    });

    return findAllProductsById;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    const productsId = products.map(product => product.id);

    const findProducts = await this.ormRepository.find({
      where: { id: In(productsId) },
    });

    const productsData = findProducts.map((product, index) => {
      return {
        ...product,
        quantity: product.quantity - products[index].quantity,
      };
    });

    const updateProducts = await this.ormRepository.save(productsData);

    return updateProducts;
  }
}

export default ProductsRepository;
