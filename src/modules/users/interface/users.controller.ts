import { Controller, Param, Get } from '@nestjs/common';
import { UsersService } from '../application/users.service';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/:userId')
  getUserPortfolio(@Param('userId') userId: string) {
    return this.usersService.getUserPortfolio(+userId);
  }
}
