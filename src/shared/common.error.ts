export class CommonError extends Error {
  key: string;
  constructor(key: string, message: string) {
    super();
    this.key = key;
    this.message = message;
  }
}
