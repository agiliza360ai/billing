import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';
import { ApiBody, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam } from '@nestjs/swagger';
import { ApiResponse } from 'src/core/responses/api-response';

@UseGuards(JwtAuthGuard)
@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @ApiOperation({
    summary: "Crear una nueva oferta",
    description: "Crea una nueva oferta con el nombre, la duracion extra del plan y la descripcion",
  })
  @ApiBody({
    schema: {
      example: {
        offer_name: "Oferta de prueba",
        extra_duration_plan: { extra_duration: 12, duration_type: "months" },
        description: "12 meses adicionales al plan",
        status: "active",
      },
      properties: {
        offer_name: { type: "string" },
        extra_duration_plan: {
          type: "object",
          properties: {
            extra_duration: { type: "number" },
            duration_type: { type: "string", enum: ["days", "weeks", "months", "years"] }
          }
        },
        description: { type: "string" },
        status: { type: "string" },
      },
      required: ["offer_name", "status"],
    }
  })
  @ApiCreatedResponse({
    schema: {
      example: {
        type: "1",
        message: "Oferta creada correctamente",
      }
    }
  })
  @Post("create-offer")
  async createOffer(@Body() createOfferDto: CreateOfferDto) {
    try {
      const createdOffer = await this.offersService.createOffer(createOfferDto);
      return ApiResponse.success("Oferta creada correctamente", createdOffer, 201);
    } catch (error) {
      return ApiResponse.error(error);
    }
  }

  @ApiOperation({
    summary: "Listar todas las ofertas",
    description: "Retorna el listado de todas las ofertas",
  })
  @ApiNotFoundResponse({
    schema: {
      example: {
        statusCode: 404,
        message: "No se pudo encontrar ninguna oferta",
        error: "Not Found",
      }
    }
  })
  @ApiOkResponse({
    schema: {
      example: {
        type: "1",
        message: "Ofertas encontradas correctamente",
        statusCode: 200,
        data: [
          {
            _id: '65f1c2d3e4f5a6b7c8d9e0c3',
            offer_name: "Oferta de prueba",
            extra_duration_plan: 1,
            descripcion: "Oferta de prueba",
            status: "active",
          },
        ],
      }
    }
  })
  @Get()
  async findAllOffers() {
    try {
      const foundOffers = await this.offersService.findAllOffers();
      return ApiResponse.success("Ofertas encontradas correctamente", foundOffers);
    } catch (error) {
      return ApiResponse.error(error);
    }
  }

  @ApiOperation({
    summary: "Obtener una oferta por ID",
    description: "Retorna el detalle de una oferta por su `offerId`.",
  })
  @ApiParam({
    name: 'offerId',
    description: 'ID de la oferta (Mongo ObjectId).',
    example: '65f1c2d3e4f5a6b7c8d9e0c3',
  })
  @ApiOkResponse({
    schema: {
      example: {
        type: "1",
        message: "Oferta encontrada correctamente",
        statusCode: 200,
        data: {
          _id: '65f1c2d3e4f5a6b7c8d9e0c3',
          offer_name: "Oferta de prueba",
          extra_duration_plan: 1,
          descripcion: "Oferta de prueba",
          status: "active",
        },
      },
    }
  })
  @ApiNotFoundResponse({
    schema: {
      example: {
        statusCode: 404,
        message: "No se pudo encontrar la oferta con id: 65f1c2d3e4f5a6b7c8d9e0c3",
        error: "Not Found",
      }
    }
  })
  @Get(':offerId')
  async findOfferById(@Param('offerId') offerId: string) {
    try {
      const foundOffer = await this.offersService.findOfferById(offerId);
      return ApiResponse.success("Oferta encontrada correctamente", foundOffer);
    } catch (error) {
      return ApiResponse.error(error);
    }
  }

  @ApiOperation({
    summary: "Actualizar una oferta por ID",
    description: "Actualiza parcialmente una oferta. Solo envía los campos a modificar.",
  })
  @ApiParam({
    name: 'offerId',
    description: 'ID de la oferta (Mongo ObjectId).',
    example: '65f1c2d3e4f5a6b7c8d9e0c3',
  })
  @ApiBody({
    schema: {
      example: {
        offer_name: "Oferta de prueba",
        extra_duration_plan: 1,
        descripcion: "Oferta de prueba",
        status: "active",
      },
    }
  })
  @ApiCreatedResponse({
    schema: {
      example: {
        type: "1",
        message: "Oferta actualizada correctamente",
        statusCode: 200,
        data: {
          _id: '65f1c2d3e4f5a6b7c8d9e0c3',
          offer_name: "Oferta de prueba",
          extra_duration_plan: 1,
          descripcion: "Oferta de prueba",
          status: "active",
        },
      }
    }
  })
  @ApiNotFoundResponse({
    schema: {
      example: {
        statusCode: 404,
        message: "No se pudo encontrar la oferta con id: 65f1c2d3e4f5a6b7c8d9e0c3",
      }
    }
  })
  @Patch(':offerId/update-offer')
  async updateOfferById(@Param('offerId') offerId: string, @Body() updateOfferDto: UpdateOfferDto) {
    try {
      const updatedOffer = await this.offersService.updateOfferById(offerId, updateOfferDto);
      return ApiResponse.success("Oferta actualizada correctamente", updatedOffer);
    } catch (error) {
      return ApiResponse.error(error);
    }
  }

  @ApiOperation({
    summary: "Eliminar una oferta por ID",
    description: "Elimina una oferta específica por su `offerId` y retorna el documento eliminado.",
  })
  @ApiParam({
    name: 'offerId',
    description: 'ID de la oferta (Mongo ObjectId).',
    example: '65f1c2d3e4f5a6b7c8d9e0c3',
  })
  @ApiOkResponse({
    schema: {
      example: {
        type: "1",
        message: "Oferta eliminada correctamente",
        statusCode: 200,
        data: {
          _id: '65f1c2d3e4f5a6b7c8d9e0c3',
          offer_name: "Oferta de prueba",
          extra_duration_plan: 1,
          descripcion: "Oferta de prueba",
          status: "active",
        },
      }
    }
  })
  @ApiNotFoundResponse({
    schema: {
      example: {
        statusCode: 404,
        message: "No se pudo encontrar la oferta con id: 65f1c2d3e4f5a6b7c8d9e0c3",
        error: "Not Found",
      }
    }
  })
  @Delete(':offerId/delete-offer')
  async removeOfferById(@Param('offerId') offerId: string) {
    try {
      const removedOffer = await this.offersService.removeOfferById(offerId);
      return ApiResponse.success("Oferta eliminada correctamente", removedOffer);
    } catch (error) {
      return ApiResponse.error(error);
    }
  }

  @ApiOperation({
    summary: "Eliminar todas las ofertas",
    description: "Elimina todas las ofertas existentes y retorna cuántas fueron eliminadas.",
  })
  @ApiOkResponse({
    schema: {
      example: {
        type: "1",
        message: "Ofertas eliminadas correctamente",
        statusCode: 200,
        data: { deletedCount: 10 },
      }
    }
  })
  @ApiNotFoundResponse({
    schema: {
      example: {
        statusCode: 404,
        message: "No se pudo encontrar ninguna oferta para eliminar",
        error: "Not Found",
      }
    }
  })
  @Delete('delete-all-offers')
  async removeAllOffers() {
    try {
      const deletedOffers = await this.offersService.removeAllOffers();
      return ApiResponse.success("Ofertas eliminadas correctamente", deletedOffers);
    } catch (error) {
      return ApiResponse.error(error);
    }
  }
}
