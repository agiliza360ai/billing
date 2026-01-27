import { Prop, SchemaFactory, Schema } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from 'mongoose';

export type OfferDocument = Offer & Document;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Offer extends Document {
    @Prop({
        required: true,
        type: String
    })
    offer_name: string;

    @Prop({
        required: true,
        type: Number
    })
    extra_duration_plan: number;

    @Prop({
        type: String
    })
    descripcion?: string;

    @Prop({ required: true })
    status: string;
}

export const OfferSchema = SchemaFactory.createForClass(Offer);
