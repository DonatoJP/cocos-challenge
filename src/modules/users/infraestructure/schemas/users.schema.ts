import { EntitySchema } from 'typeorm';
import { User } from '../../domain/users.model';

export const UserSchema = new EntitySchema<User>({
  name: 'User',
  target: User,
  tableName: 'users',
  columns: {
    id: {
      type: 'integer',
      primary: true,
    },
    email: {
      type: 'varchar',
    },
    accountnumber: {
      type: 'varchar',
    },
  },
  relations: {
    orders: {
      type: 'one-to-many',
      target: 'Order',
      inverseSide: 'user',
      cascade: true,
    },
  },
});
