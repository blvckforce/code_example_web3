import { ApiProperty } from '@nestjs/swagger';
import { IResponse } from '../interfaces/responce.inteface';

export class ResponseError implements IResponse {
  constructor(infoMessage: string, data?: any) {
    this.success = false;
    this.message = infoMessage;
    this.data = data;
    console.warn(
      new Date().toString() +
      ' - [Response]: ' +
      infoMessage +
      (data ? ' - ' + JSON.stringify(data) : ''),
    );
  }

  @ApiProperty()
  message: string;

  @ApiProperty()
  data: any[];

  errorMessage: any;

  error: any;

  @ApiProperty()
  success: boolean;
}

export class ResponseSuccess<T> implements IResponse {
  constructor(infoMessage: string, data?: any) {
    this.success = true;
    this.message = infoMessage;
    this.data = data;
  }

  @ApiProperty()
  message: string;

  @ApiProperty()
  data: T;

  errorMessage: any;

  error: any;

  @ApiProperty()
  success: boolean;
}
