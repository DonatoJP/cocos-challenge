import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateOrderDTO } from './dto/createOrder.dto';
import { OrdersService } from '../application/orders.service';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}
  @Get()
  async getAllOrders() {
    return this.ordersService.getAllOrders();
  }

  @Post()
  createOrder(@Body() order: CreateOrderDTO) {
    throw new Error(`Not implemented ${JSON.stringify(order)}`);
    //return this.ordersService.createOrder(order);
  }
}
