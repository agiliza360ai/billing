import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlanesModule } from './modules/planes/planes.module';
import { PagosModule } from './modules/pagos/pagos.module';
import { SuscripcionesModule } from './modules/suscripciones/suscripciones.module';
import { AuthModule } from './modules/auth/auth.module';
import { OffersModule } from './modules/offers/offers.module';
import { helmetConfig } from './core/config/helmet.config';
import helmet from 'helmet';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB'),
        dbName: 'servicios-generales-prod',
      }),
      inject: [ConfigService],
    }),
    PlanesModule,
    AuthModule,
    PagosModule,
    SuscripcionesModule,
    OffersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        helmet(helmetConfig),
      )
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
