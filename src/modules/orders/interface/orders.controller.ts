import { Body, Controller, Post } from '@nestjs/common';
import { CreateOrderDTO } from './dto/createOrder.dto';

@Controller()
export class OrdersController {
  @Post()
  createOrder(@Body() order: CreateOrderDTO) {
    throw new Error(`Not implemented ${JSON.stringify(order)}`);
    //return this.ordersService.createOrder(order);
  }
}
