export interface IUser<O = any> {
  id?: number;
  email?: string;
  accountnumber?: string;
  orders?: O[];
}

export class User implements IUser {
  public orders?: any[];

  constructor(
    public id?: number,
    public email?: string,
    public accountnumber?: string,
  ) {}

  static from(user: IUser): User {
    const u = new User(user.id, user.email, user.accountnumber);
    if (user.orders) u.orders = user.orders;
    return u;
  }
}
