import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Res,
  UsePipes,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateOrderDTO, createOrderSchema } from './dto/createOrder.dto';
import { OrdersService } from '../application/orders.service';
import { ZodValidationPipe } from 'src/pipes/zodValidator.pipe';
import { Response } from 'express';
import { InvalidNewOrderInput, OrderNotFound } from '../domain/orders.errors';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}
  @Get()
  async getAllOrders() {
    return this.ordersService.getAllOrders();
  }

  @Post()
  @UsePipes(new ZodValidationPipe(createOrderSchema))
  createOrder(@Body() order: CreateOrderDTO, @Res() res: Response) {
    return this.ordersService
      .createOrder(order)
      .then((o) => res.status(201).json(o))
      .catch((err) => {
        if (err instanceof InvalidNewOrderInput) {
          return res.status(400).json({ message: err.message, input: order });
        }

        throw new InternalServerErrorException(err);
      });
  }

  @Post('/:id/cancel')
  @HttpCode(200)
  async cancelOrder(@Param('id') id: string, @Res() res: Response) {
    try {
      const result = await this.ordersService.cancelOrder(+id);
      return res.status(200).json(result);
    } catch (e) {
      if (e instanceof OrderNotFound) {
        return res.status(400).json({ message: e.message });
      }

      return new InternalServerErrorException();
    }
  }
}
