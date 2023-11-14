/* eslint-disable @typescript-eslint/ban-types */

import { AllowNull, Default, Validate } from 'sequelize-typescript';
import { ApiResponseOptions } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import * as _ from 'lodash';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CanActivate } from '@nestjs/common/interfaces';

import { Transform } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsNotEmpty, IsObject } from 'class-validator';
import { getPaginationResponseDto, getResponseSuccessDto, setType } from '../utils/functions';

export const Required = (defaultValue?: any) => (...params) => {
  Validate({
    notEmpty: true,
    notNull: true,
  })(...params);
  AllowNull(false)(...params);
  if (defaultValue !== undefined) {
    Default(defaultValue)(...params);
  }
};

export const SuccessResponse = (
  options?: ApiResponseOptions,
): MethodDecorator & ClassDecorator => {
  return (target, propertyKey?, descriptor?) => {
    if (!_.isNil(options) && 'type' in options) {
      setType(options, options.type, getResponseSuccessDto);
    }

    ApiOkResponse(options)(target, propertyKey, descriptor);
  };
};

export const SuccessPaginateResponse = (
  options?: ApiResponseOptions,
): MethodDecorator & ClassDecorator => {
  return (target, propertyKey?, descriptor?) => {
    if (!_.isNil(options) && 'type' in options) {
      setType(options, options.type, getPaginationResponseDto);
    }

    SuccessResponse(options)(target, propertyKey, descriptor);
  };
};

export const JwtGuard = (...guards: (CanActivate | Function)[]) => (
  target,
  propertyKey?,
  descriptor?,
) => {
  UseGuards(AuthGuard('jwt'), ...guards)(target, propertyKey, descriptor);
  ApiBearerAuth()(target, propertyKey, descriptor);
};

// export type IOperation = {
//   operation?: ApiOperationOptions;
//   response?: ApiResponseOptions & { hasPagination?: boolean };
//   policiesHandlers?: PolicyHandler | PolicyHandler[];
//   isPublic?: boolean;
// };

// export const Operation = ({
//   operation,
//   response,
//   policiesHandlers,
//   isPublic,
// }: IOperation) => (target, propertyKey, descriptor) => {
//   const dResponse =
//     response?.hasPagination === true
//       ? SuccessPaginateResponse
//       : SuccessResponse;
//
//   CheckPolicies(..._.flattenDeep([policiesHandlers]))(
//     target,
//     propertyKey,
//     descriptor,
//   );
//   ApiOperation(operation)(target, propertyKey, descriptor);
//   dResponse(response)(target, propertyKey, descriptor);
//   if (isPublic !== true) {
//     JwtGuard()(target, propertyKey, descriptor);
//   }
// };

export const ToNumber = () => (target, propertyKey) => {
  Transform(({ value }) => _.toNumber(value))(target, propertyKey);
};

type ArrayType = {
  type?: any;
  isNotEmpty?: boolean;
  min?: number;
  max?: number;
};

export const Array = (options?: ArrayType) => (target, propertyKey) => {
  IsArray()(target, propertyKey);
  if (options?.isNotEmpty === true) {
    IsNotEmpty()(target, propertyKey);
  }
  if (!_.isNil(options?.type)) {
    // ValidateNested({ each: true })(target, propertyKey);
    // Type(() => options.type)(target, propertyKey);
    IsObject({ each: true })(target, propertyKey);
  }

  if (!_.isNil(options?.min)) {
    ArrayMinSize(options.min)(target, propertyKey);
  }
  if (!_.isNil(options?.max)) {
    ArrayMaxSize(options.max)(target, propertyKey);
  }
};

// export const User = createParamDecorator(
//   (data: unknown, ctx: ExecutionContext): UserDbDto => {
//     const request = ctx.switchToHttp().getRequest();
//     return request?.user;
//   },
// );

// export function IsCron(validationOptions?: ValidationOptions) {
//   return (object: any, propertyName: string) => {
//     registerDecorator({
//       name: IsCron.name,
//       target: object.constructor,
//       propertyName,
//       options: validationOptions,
//       validator: {
//         validate(value: any) {
//           const cronResult = cron(value);
//           return cronResult.isValid();
//         },
//         defaultMessage() {
//           return `${propertyName} invalid cron value`;
//         },
//       },
//     });
//   };
// }

export const ToBoolean = () => Transform(({ obj, key }) => {
  const value = obj[key];

  return value === 'true' ? true : value === 'false' ? false : undefined;
});
