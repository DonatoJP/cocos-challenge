export class OrderNotFound extends Error {
  constructor() {
    super('Only orders in status NEW can be cancelled');
  }
}
