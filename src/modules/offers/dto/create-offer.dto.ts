import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateOfferDto {
    @IsString({ message: "El nombre de la oferta debe ser una cadena de texto" })
    @IsNotEmpty({ message: "El nombre de la oferta es requerido" })
    offer_name: string;

    @IsNumber({
        allowInfinity: false,
        allowNaN: false,
    }, { message: "La duracion extra del plan debe ser un numero" })
    @IsNotEmpty({ message: "La duracion extra del plan es requerida" })
    extra_duration_plan: number;

    @IsOptional()
    @IsString({ message: "La descripcion debe ser una cadena de texto" })
    descripcion?: string;

    status: string;
}
