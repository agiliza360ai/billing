import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';
import { ApiBody, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
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
        extra_duration_plan: 1,
        descripcion: "Oferta de prueba",
        status: "active",
      },
      properties: {
        offer_name: { type: "string" },
        extra_duration_plan: { type: "number" },
        descripcion: { type: "string" },
        status: { type: "string" },
      },
      required: ["offer_name", "extra_duration_plan", "status"],
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
  // @Post()
  // createOffer(@Body() createOfferDto: CreateOfferDto) {
  //   return this.offersService.create(createOfferDto);
  // }

  // @Get()
  // findAllOffers() {
  //   return this.offersService.findAll();
  // }

  // @Get(':id')
  // findOfferById(@Param('id') id: string) {
  //   return this.offersService.findOne(+id);
  // }

  // @Patch(':id')
  // updateOffer(@Param('id') id: string, @Body() updateOfferDto: UpdateOfferDto) {
  //   return this.offersService.update(+id, updateOfferDto);
  // }

  // @Delete(':id')
  // removeOffer(@Param('id') id: string) {
  //   return this.offersService.remove(+id);
  // }
}
