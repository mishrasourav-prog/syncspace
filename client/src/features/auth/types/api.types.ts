export type ApiResponse<T = void> = {
  success: boolean;

  statusCode: number;

  message: string;
} & ([T] extends [void]
  ? {
      data?: never;
    }
  : {
      data: T;
    });
