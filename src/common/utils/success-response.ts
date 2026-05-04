export interface SuccessResponse<T> {
  message: string;
  data: T;
}

export function successResponse<T>(
  data: T,
  message?: string,
): SuccessResponse<T> {
  return {
    message: message ?? 'Operation completed successfully',
    data,
  };
}
