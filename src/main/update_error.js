export class UpdateError extends Error {
  constructor(message, critical = false) {
    super(message);
    this.type = 'UpdateError';
    this.name = 'UpdateError';
    this.critical = critical;
  }
}
