import {
  registerDecorator,
  type ValidationArguments,
  type ValidationOptions,
} from 'class-validator';
import { isValidCpfOrCnpj } from '../utils/document.util';

export function IsCpfOrCnpj(validationOptions?: ValidationOptions): PropertyDecorator {
  return function (object: object, propertyName: string | symbol) {
    registerDecorator({
      name: 'isCpfOrCnpj',
      target: object.constructor,
      propertyName: String(propertyName),
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          if (typeof value !== 'string') {
            return false;
          }

          return isValidCpfOrCnpj(value);
        },
        defaultMessage(args: ValidationArguments): string {
          return `${String(args.property)} deve ser um CPF ou CNPJ válido.`;
        },
      },
    });
  };
}
