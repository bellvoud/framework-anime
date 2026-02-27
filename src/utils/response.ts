export const successResponse = <T>(data: T, message = "Success") => ({
  success: true,
  message,
  data,
  timestamp: new Date().toISOString(),
});

export const errorResponse = (message: string, code = 400, errors?: any) => ({
  success: false,
  message,
  code,
  errors,
  timestamp: new Date().toISOString(),
});
