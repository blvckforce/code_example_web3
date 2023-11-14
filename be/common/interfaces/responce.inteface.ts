export interface IResponse {
  success: boolean;
  message: string;
  errorMessage: string;
  data: unknown;
  error: any;
}
