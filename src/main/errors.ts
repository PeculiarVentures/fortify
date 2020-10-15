export class UpdateError extends Error {
  public type = 'UpdateError';

  public name = 'UpdateError';

  public critical: boolean;

  constructor(message: string, critical = false) {
    super(message);

    this.critical = critical;
  }
}
