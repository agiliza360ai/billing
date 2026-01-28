import { Module } from '@nestjs/common';
import { SuscripcionesService } from './suscripciones.service';
import { SuscripcionesController } from './suscripciones.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Suscripcion, SuscripcionSchema } from './entities/suscripcion.entity';
import { PagosModule } from '../pagos/pagos.module';
import { PlanesModule } from '../planes/planes.module';
import { OffersModule } from '../offers/offers.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Suscripcion.name, schema: SuscripcionSchema }
    ]),
    PagosModule,
    PlanesModule,
    OffersModule,
  ],
  controllers: [SuscripcionesController],
  providers: [SuscripcionesService],
})
export class SuscripcionesModule {}
