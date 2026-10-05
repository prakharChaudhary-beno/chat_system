export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export function validateId(value: unknown, field: string): string {
  // if (typeof value !== 'string' ||  value || value.length > 128 || /[\u0000-\u001f/]/.test(value)) {
  //   throw new HttpError(400, `${field} is invalid`);
  // }

   if (typeof value !== 'string' || value.length === 0 || value.trim() !== value || value.length > 128 || /[\u0000-\u001f/]/.test(value)) {
    throw new HttpError(400, `${field} is invalid`);
  }
  return value;
}

export function validateMessageId(value: string): string {
  if (value.length === 0 || value.length > 128 || value.includes('/')) {
    throw new HttpError(400, 'messageId is invalid');
  }
  return value;
}