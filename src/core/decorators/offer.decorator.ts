import { registerDecorator, ValidationArguments } from "class-validator";

type OfferChoiceOptions = {
  /**
   * Si true, permite que no se envíe ni `discount` ni `extra_duration_plan` (útil para UPDATE).
   * Si false/undefined, exige exactamente uno de los dos (útil para CREATE).
   */
  allowNeither?: boolean;
};

/**
 * Valida que una oferta se cree/actualice con:
 * - SOLO `discount` o SOLO `extra_duration_plan`
 * - (opcionalmente) permitir ninguno de los dos en update
 */
export function OnlyDiscountOrExtraDuration(
  options: OfferChoiceOptions = {},
  validationOptions?: any,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "onlyDiscountOrExtraDuration",
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(_value: any, args: ValidationArguments) {
          const obj: any = args.object as any;

          const hasExtra =
            obj?.extra_duration_plan !== undefined && obj?.extra_duration_plan !== null;

          // Consideramos que hay "descuento" cuando existe el objeto discount
          // (la validez interna del descuento se valida en CreateDescuentoDto)
          const hasDiscount = obj?.discount !== undefined && obj?.discount !== null;

          // Nunca permitir ambos simultáneamente
          if (hasDiscount && hasExtra) return false;

          // En CREATE: exigir exactamente uno
          if (!options.allowNeither) {
            return hasDiscount || hasExtra;
          }

          // En UPDATE: permitir ninguno (pero ya evitamos ambos)
          return true;
        },
        defaultMessage(_args: ValidationArguments) {
          if (options.allowNeither) {
            return "No puedes enviar `discount` y `extra_duration_plan` al mismo tiempo.";
          }
          return "Debes enviar SOLO `discount` o SOLO `extra_duration_plan` (uno de los dos es obligatorio).";
        },
      },
    });
  };
}

