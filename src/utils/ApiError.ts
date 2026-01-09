export class ApiError extends Error {
  statusCode: number;
  errors?: any[];
  data?: Record<string, any>;

  constructor(statusCode: number, message: string, data?: Record<string, any> | any[]) {
    super(message);
    this.statusCode = statusCode;

    if (Array.isArray(data)) {
      this.errors = data;
    } else {
      this.data = data;
    }
  }
}
