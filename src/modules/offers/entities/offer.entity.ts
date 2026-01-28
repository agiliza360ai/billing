import { Prop, SchemaFactory, Schema } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from 'mongoose';
import { OfferExtraDurationType, OfferStatus } from "src/types/enums";

export type OfferDocument = Offer & Document;

export class Descuento {
    @Prop({
        type: Number,
        required: false
    })
    percentage?: number;
     
    @Prop({
        type: Number,
        required: false
    })
    fixed_amount?: number;
}

export class ExtraDurationPlan {
    @Prop({
        type: Number,
        required: true
    })
    extra_duration: number;

    @Prop({
        type: String,
        required: true,
        enum: OfferExtraDurationType
    })
    duration_type: OfferExtraDurationType;
}

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Offer extends Document {
    @Prop({
        required: true,
        type: String
    })
    offer_name: string;

    @Prop({
        type: String
    })
    description?: string;

    @Prop({
        type: Object,
        required: false
    })
    discount?: Descuento;

    @Prop({
        required: false,
        type: ExtraDurationPlan
    })
    extra_duration_plan?: ExtraDurationPlan;

    @Prop({
        required: true,
        type: String,
        enum: OfferStatus,
        default: "active"
    })
    status: OfferStatus;
}

export const OfferSchema = SchemaFactory.createForClass(Offer);

// Regla de negocio: una oferta debe tener SOLO descuento o SOLO extra duración (exactamente uno)
OfferSchema.pre('validate', function (next) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const doc: any = this as any;

  const hasDiscount = doc?.discount !== undefined && doc?.discount !== null;
  const hasExtra =
    doc?.extra_duration_plan !== undefined &&
    doc?.extra_duration_plan !== null &&
    doc?.extra_duration_plan?.extra_duration !== undefined &&
    doc?.extra_duration_plan?.duration_type !== undefined;

  if (hasDiscount && hasExtra) {
    return next(new Error("No puedes guardar una oferta con `discount` y `extra_duration_plan` al mismo tiempo."));
  }

  if (!hasDiscount && !hasExtra) {
    return next(new Error("Debes guardar una oferta con `discount` o con `extra_duration_plan`."));
  }

  return next();
});
