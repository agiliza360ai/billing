import { Transform, Type } from "class-transformer";
import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min, ValidateIf, ValidateNested, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface, registerDecorator } from "class-validator";
import { BrandExists } from "src/validators/brand-exists.validator";
import { PlanExists } from "src/validators/plan-exists.validator";
import { Descuento } from "src/types/enums";

// Decorador personalizado para validar que solo una propiedad de descuento esté presente
function OnlyOneDiscountType(validationOptions?: any) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'onlyOneDiscountType',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const obj = args.object as CreateDescuentoDto;
          const hasPercentage = obj.percentage !== undefined && obj.percentage !== null;
          const hasFixedAmount = obj.fixed_amount !== undefined && obj.fixed_amount !== null;

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

export class CreateDescuentoDto implements Descuento {
  @IsOptional()
  @ValidateIf((o: CreateDescuentoDto) => o.fixed_amount === undefined || o.fixed_amount === null)
  @IsNumber({}, { message: "El porcentaje debe ser un número" })
  @Min(0, { message: "El porcentaje no puede ser menor a 0" })
  @Max(100, { message: "El porcentaje no puede ser mayor a 100" })
  percentage?: number;

  @IsOptional()
  @ValidateIf((o: CreateDescuentoDto) => o.percentage === undefined || o.percentage === null)
  @IsNumber({}, { message: "El monto fijo debe ser un número" })
  @Min(0, { message: "El monto fijo no puede ser menor a 0" })
  fixed_amount?: number;

  @IsOptional()
  @OnlyOneDiscountType({
    message: 'Solo se puede especificar un tipo de descuento: porcentaje o monto fijo, no ambos'
  })
  @IsString({ message: "La descripción debe ser una cadena de texto" })
  description?: string;
}

export class CreateSuscripcionDto {
  @IsString()
  @BrandExists({ message: "El brandId proporcionado no existe en la colección brands" })
  brandId: string;

  @IsString()
  @PlanExists({ message: "El planId proporcionado no existe en la colección plans" })
  planId: string;

  @IsOptional()
  @IsDate({ message: "start_date debe ser una fecha válida (ej: 2025-12-16 o 2025-12-16T00:00:00.000Z)" })
  @Transform(({ value }) => {
    if (!value) return undefined;
    const date = new Date(value);
    return isNaN(date.getTime()) ? value : date;
  })
  start_date?: Date;

  @IsOptional()
  @IsDate({ message: "renovate_date debe ser una fecha válida (ej: 2025-12-16 o 2025-12-16T00:00:00.000Z)" })
  @Transform(({ value }) => {
    if (!value) return undefined;
    const date = new Date(value);
    return isNaN(date.getTime()) ? value : date;
  })
  renovate_date?: Date;

  @IsString()
  @IsEnum(["transferencia", "billetera_digital", "pago_link"], {
    message: "tipo_pago debe ser: 'transferencia', 'billetera_digital' o 'pago_link'"
  })
  @IsNotEmpty({ message: "tipo_pago es requerido" })
  tipo_pago?: "transferencia" | "billetera_digital"| "pago_link";

  @IsString()
  @IsNotEmpty({ message: "provider es requerido" })
  provider: string;

  @IsEnum(["activo", "inactivo"], {
    message: "status debe ser: 'activo' o 'inactivo'"
  })
  @IsNotEmpty({ message: "status es requerido" })
  status: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateDescuentoDto)
  discount?: CreateDescuentoDto;
}
