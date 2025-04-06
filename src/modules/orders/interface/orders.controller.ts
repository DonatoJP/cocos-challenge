import { Body, Controller, Get, Post, UsePipes } from '@nestjs/common';
import { CreateOrderDTO, createOrderSchema } from './dto/createOrder.dto';
import { OrdersService } from '../application/orders.service';
import { ZodValidationPipe } from 'src/pipes/zodValidator.pipe';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}
  @Get()
  async getAllOrders() {
    return this.ordersService.getAllOrders();
  }

  @Post()
  @UsePipes(new ZodValidationPipe(createOrderSchema))
  createOrder(@Body() order: CreateOrderDTO) {
    return this.ordersService.createOrder(order);
  }
}
