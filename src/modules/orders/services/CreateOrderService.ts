import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import { check } from 'prettier';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository') private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError('Customer does not exists');
    }

    const checkAllProductsById = await this.productsRepository.findAllById(
      products,
    );

    if (products.length !== checkAllProductsById.length) {
      throw new AppError('Products does not exists');
    }

    const allProducts = checkAllProductsById.map((product, index) => {
      if (product.quantity < products[index].quantity) {
        throw new AppError('Quantity insulficient');
      }

      return {
        product_id: product.id,
        price: product.price,
        quantity: products[index].quantity,
      };
    });

    const order = await this.ordersRepository.create({
      customer,
      products: allProducts,
    });

    await this.productsRepository.updateQuantity(products);

    return order;
  }
}

export default CreateOrderService;
