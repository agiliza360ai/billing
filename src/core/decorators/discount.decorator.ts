import { registerDecorator, ValidationArguments } from "class-validator";

// Decorador personalizado para validar que solo una propiedad de descuento esté presente
export function OnlyOneDiscountType(validationOptions?: any) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'onlyOneDiscountType',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const obj: any = args.object as any;
          const hasPercentage = obj?.percentage !== undefined && obj?.percentage !== null;
          const hasFixedAmount = obj?.fixed_amount !== undefined && obj?.fixed_amount !== null;

          // Solo permitir una de las dos propiedades o ninguna
          return !(hasPercentage && hasFixedAmount);
        },
        defaultMessage(args: ValidationArguments) {
          return 'Solo se puede especificar un tipo de descuento: porcentaje o monto fijo, no ambos';
        }
      }
    });
  };
}

// Decorador para exigir que exista al menos un valor de descuento (porcentaje o monto fijo)
export function AtLeastOneDiscountValue(validationOptions?: any) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'atLeastOneDiscountValue',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const obj: any = args.object as any;
          const hasPercentage = obj?.percentage !== undefined && obj?.percentage !== null;
          const hasFixedAmount = obj?.fixed_amount !== undefined && obj?.fixed_amount !== null;
          return hasPercentage || hasFixedAmount;
        },
        defaultMessage(args: ValidationArguments) {
          return 'Debe especificar un descuento: porcentaje o monto fijo';
        }
      }
    });
  };
}
