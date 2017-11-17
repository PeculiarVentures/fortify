const ERROR_NAME = "UpdateError";

export class UpdateError extends Error {

  public type: string;
  public critical = false;

  constructor(message: string, critical = false) {
    super(message);
    this.type = ERROR_NAME;
    this.name = ERROR_NAME;
    this.critical = critical;
  }
}
