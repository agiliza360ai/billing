import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { SuscriptionStatus } from "src/types/enums";

export type SuscripcionDocument = Suscripcion & Document;

@Schema({ timestamps: { createdAt: "created_at", updatedAt: "updated_at" } })
export class Suscripcion extends Document {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    required: true,
    name: "brand_id",
    ref: "Brand"
  })
  brandId: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    required: true,
    name: "plan_id",
    ref: "Plan"
  })
  planId: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    required: false,
    name: "offer_id",
    ref: "Offer"
  })
  offerId?: string;

  @Prop({
    type: Date,
    required: true,
    default: Date.now
  })
  start_date: Date;

  @Prop({
    type: Date,
    required: true,
  })
  renovate_date: Date;

  @Prop({
    type: String,
    enum: ["transferencia", "billetera_digital", "pago_link"],
    required: true
  })
  tipo_pago: string;

  @Prop({
    type: String,
    required: true
  })
  provider: string;

  @Prop({
    type: String,
    enum: SuscriptionStatus,
    default: "activo",
    required: true
  })
  status: SuscriptionStatus;
}

export const SuscripcionSchema = SchemaFactory.createForClass(Suscripcion);
