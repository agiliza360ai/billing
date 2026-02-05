import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { PlanDuration } from 'src/types/enums';


@Schema({ timestamps: false })
export class Features {
  @Prop({ required: true, type: Boolean })
  ai_agent: boolean;
  @Prop({ required: true, type: Boolean })
  priority_support: boolean;

  @Prop({ type: Boolean })
  carta_digital: boolean;

  @Prop({ type: Boolean })
  cash_closing: boolean;

  @Prop({ required: true, type: Boolean })
  chats_module: boolean;

  @Prop({ type: Boolean })
  mass_messaging: boolean;

  @Prop({ type: Boolean })
  yango_integration: boolean;

  @Prop({ type: Boolean })
  reservations: boolean;

  @Prop({ type: Boolean })
  order_module: boolean;

  @Prop({ type: Boolean })
  dashboard_module: boolean;

  @Prop({ type: Boolean })
  customer_module: boolean;

  @Prop({ type: Boolean })
  complaints_module: boolean;

  @Prop({ type: Boolean })
  kds_module: boolean;

  @Prop({ type: Boolean })
  multilocals_module: boolean;

  @Prop({ type: Boolean })
  unlimited_orders: boolean;

  @Prop({ type: Boolean })
  integrations: boolean;

  @Prop({ type: Boolean })
  premium_website: boolean;
}

export type PlanDocument = Plan & Document;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Plan extends Document  {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: Number })
  price: number;

  @Prop({ required: true, type: String })
  currency_type: string;

  @Prop({
    required: true,
    type: String,
    enum: PlanDuration,
    default: "monthly"
  })
  duration: PlanDuration;

  @Prop({ required: true, type: Number })
  order_limit: number;

  @Prop({ type: Object, required: true })
  features: Features;

  @Prop({ 
    type: String, 
    enum: ['active', 'inactive'], 
    default: 'active'
  })
  status: string;
}

export const PlanSchema = SchemaFactory.createForClass(Plan);