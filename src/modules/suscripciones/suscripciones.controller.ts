import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { SuscripcionesService } from './suscripciones.service';
import { CreateSuscripcionDto } from './dto/create-suscripcion.dto';
import { UpdateSuscripcionDto } from './dto/update-suscripcion.dto';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ApiResponse } from 'src/core/responses/api-response';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Suscripciones')
@Controller('suscripciones')
export class SuscripcionesController {
  constructor(private readonly suscService: SuscripcionesService) { }

  @ApiOperation({
    summary: 'Suscribirse a un plan',
    description:
      'Crea una suscripción para una marca y un plan. `renovate_date` se recalcula automáticamente en backend según la duración del plan y luego se aplica la oferta (si envías `offerId`). Además, se registra automáticamente un pago asociado.',
  })
  @ApiBody({
    schema: {
      example: {
        brandId: '65f1c2d3e4f5a6b7c8d9e0a1',
        planId: '65f1c2d3e4f5a6b7c8d9e0f1',
        tipo_pago: 'transferencia',
        provider: 'BCP - Cuenta 123-456-789',
        offerId: '65f1c2d3e4f5a6b7c8d9e0c3',
        status: 'activo',
      },
    },
  })
  @ApiCreatedResponse({
    schema: {
      example: {
        _id: '65f1c2d3e4f5a6b7c8d9e0b2',
        brandId: '65f1c2d3e4f5a6b7c8d9e0a1',
        planId: '65f1c2d3e4f5a6b7c8d9e0f1',
        start_date: '2026-01-26T12:00:00.000Z',
        renovate_date: '2026-02-26T12:00:00.000Z',
        tipo_pago: 'transferencia',
        provider: 'BCP - Cuenta 123-456-789',
        discount: { percentage: 10, description: 'Descuento por lanzamiento' },
        status: 'activo',
        created_at: '2026-01-26T12:00:00.000Z',
        updated_at: '2026-01-26T12:00:00.000Z',
      },
    },
  })
  @ApiBadRequestResponse({
    schema: {
      example: {
        statusCode: 400,
        message: ['provider es requerido'],
        error: 'Bad Request',
      },
    },
  })
  @ApiUnauthorizedResponse({
    schema: { example: { statusCode: 401, message: 'Unauthorized' } },
  })
  @Post("suscribe-to-plan")
  async suscribeToPlan(@Body() suscripcionData: CreateSuscripcionDto) {
    try {
      const createdSuscription = await this.suscService.createSuscriptionToPlan(suscripcionData);
      return ApiResponse.success('Suscripción creada correctamente', createdSuscription);
    } catch (error) {
      return ApiResponse.error(error);
    }
  }

  @ApiOperation({
    summary: 'Listar suscripciones',
    description:
      'Retorna suscripciones. Puedes filtrar por `planId` o por `brandId` (solo uno a la vez). Si no envías filtros, retorna todas.',
  })
  @ApiQuery({
    name: 'planId',
    required: false,
    description: 'Filtra por planId (no usar junto con brandId).',
    example: '65f1c2d3e4f5a6b7c8d9e0f1',
  })
  @ApiQuery({
    name: 'brandId',
    required: false,
    description: 'Filtra por brandId (no usar junto con planId).',
    example: '65f1c2d3e4f5a6b7c8d9e0a1',
  })
  @ApiOkResponse({
    schema: {
      example: [
        {
          _id: '65f1c2d3e4f5a6b7c8d9e0b2',
          brandId: { _id: '65f1c2d3e4f5a6b7c8d9e0a1', name: 'Brand Demo', logo: 'logo.png' },
          planId: { _id: '65f1c2d3e4f5a6b7c8d9e0f1', name: 'Plan Pro', price: 49.99 },
          start_date: '2026-01-26T12:00:00.000Z',
          renovate_date: '2026-02-26T12:00:00.000Z',
          tipo_pago: 'transferencia',
          provider: 'BCP - Cuenta 123-456-789',
          discount: { percentage: 10, description: 'Descuento por lanzamiento' },
          status: 'activo',
          created_at: '2026-01-26T12:00:00.000Z',
          updated_at: '2026-01-26T12:00:00.000Z',
        },
      ],
    },
  })
  @ApiBadRequestResponse({
    schema: {
      example: {
        status: 400,
        message: 'Use solo un criterio de búsqueda: id, planId o brandId',
        error: 'Bad request',
      },
    },
  })
  @ApiNotFoundResponse({
    schema: {
      example: {
        status: 404,
        message: 'No se pudo encontrar ninguna suscripción',
        error: 'Not found',
      },
    },
  })
  @ApiUnauthorizedResponse({
    schema: { example: { statusCode: 401, message: 'Unauthorized' } },
  })
  @Get()
  async findAllSuscriptions(
    @Query("planId") planId?: string,
    @Query("brandId") brandId?: string,
  ) {
    try {
      const suscriptions = await this.suscService.getAllSuscriptions(
        planId,
        brandId
      );
      return ApiResponse.success('Suscripciones encontradas correctamente', suscriptions);
    } catch (error) {
      return ApiResponse.error(error);
    }
  }

  @ApiOperation({
    summary: 'Obtener suscripción por ID',
    description: 'Retorna el detalle de una suscripción por su `suscriptionId`.',
  })
  @ApiParam({
    name: 'suscriptionId',
    description: 'ID de la suscripción (Mongo ObjectId).',
    example: '65f1c2d3e4f5a6b7c8d9e0b2',
  })
  @ApiOkResponse({
    schema: {
      example: {
        _id: '65f1c2d3e4f5a6b7c8d9e0b2',
        brandId: '65f1c2d3e4f5a6b7c8d9e0a1',
        planId: '65f1c2d3e4f5a6b7c8d9e0f1',
        start_date: '2026-01-26T12:00:00.000Z',
        renovate_date: '2026-02-26T12:00:00.000Z',
        tipo_pago: 'transferencia',
        provider: 'BCP - Cuenta 123-456-789',
        discount: { percentage: 10, description: 'Descuento por lanzamiento' },
        status: 'activo',
      },
    },
  })
  @ApiNotFoundResponse({
    schema: {
      example: {
        status: 404,
        message: 'No se pudo encontrar la suscripción con id: 65f1c2d3e4f5a6b7c8d9e0b2',
        error: 'Not found',
      },
    },
  })
  @ApiUnauthorizedResponse({
    schema: { example: { statusCode: 401, message: 'Unauthorized' } },
  })
  @Get(":suscriptionId")
  async  findSuscriptionById(@Param("suscriptionId") suscriptionId: string) {
    try {
      const suscription = await this.suscService.getSuscriptionById(suscriptionId);
      return ApiResponse.success('Suscripción encontrada correctamente', suscription);
    } catch (error) {
      return ApiResponse.error(error);
    }
  }

  @ApiOperation({
    summary: 'Actualizar suscripción por ID',
    description:
      'Actualiza parcialmente una suscripción. No permite modificar `brandId` ni `planId` (por DTO).',
  })
  @ApiParam({
    name: 'suscriptionId',
    description: 'ID de la suscripción (Mongo ObjectId).',
    example: '65f1c2d3e4f5a6b7c8d9e0b2',
  })
  @ApiBody({
    schema: {
      example: {
        status: 'inactivo',
        provider: 'BCP - Cuenta 999-888-777',
      },
    },
  })
  @ApiOkResponse({
    schema: {
      example: {
        _id: '65f1c2d3e4f5a6b7c8d9e0b2',
        status: 'inactivo',
        provider: 'BCP - Cuenta 999-888-777',
        updated_at: '2026-01-26T13:00:00.000Z',
      },
    },
  })
  @ApiNotFoundResponse({
    schema: {
      example: {
        status: 404,
        message:
          "No se pudo encontrar la suscripción del id '65f1c2d3e4f5a6b7c8d9e0b2' y por ende no se puede actualizar...",
        error: 'Not found',
      },
    },
  })
  @ApiUnauthorizedResponse({
    schema: { example: { statusCode: 401, message: 'Unauthorized' } },
  })
  @Patch(":suscriptionId/update-suscription")
  async updateSuscription(
    @Param("suscriptionId") suscId: string,
    @Body() updateData: UpdateSuscripcionDto
  ) {
    try {
      const updatedSuscription = await this.suscService.findAndUpdateSuscriptionById(
        suscId,
        updateData
      );
      return ApiResponse.success('Suscripción actualizada correctamente', updatedSuscription);
    } catch (error) {
      return ApiResponse.error(error);
    }
  }

  @ApiOperation({
    summary: 'Eliminar suscripciones',
    description:
      'Elimina suscripciones. Puedes filtrar por `planId` o por `brandId` (solo uno a la vez). Si no envías filtros, elimina todas.',
  })
  @ApiQuery({
    name: 'planId',
    required: false,
    description: 'Elimina por planId (no usar junto con brandId).',
    example: '65f1c2d3e4f5a6b7c8d9e0f1',
  })
  @ApiQuery({
    name: 'brandId',
    required: false,
    description: 'Elimina por brandId (no usar junto con planId).',
    example: '65f1c2d3e4f5a6b7c8d9e0a1',
  })
  @ApiOkResponse({
    schema: { example: { acknowledged: true, deletedCount: 3 } },
  })
  @ApiNotFoundResponse({
    schema: {
      example: {
        status: 404,
        message: 'No se pudo encontrar ninguna suscripción, por ende no hay nada que borrar',
        error: 'Not found',
      },
    },
  })
  @ApiUnauthorizedResponse({
    schema: { example: { statusCode: 401, message: 'Unauthorized' } },
  })
  @Delete("delete-all-suscriptions")
  async removeAllSuscriptions(
    @Query("planId") planId?: string,
    @Query("brandId") brandId?: string,
  ) {
    try {
      const deletedSuscriptions = await this.suscService.removeAllSuscriptions(
        planId,
        brandId
      );
      return ApiResponse.success('Suscripciones eliminadas correctamente', deletedSuscriptions);
    } catch (error) {
      return ApiResponse.error(error);
    }
  }

  @ApiOperation({
    summary: 'Eliminar suscripción por ID',
    description: 'Elimina una suscripción específica por su `suscriptionId`.',
  })
  @ApiParam({
    name: 'suscriptionId',
    description: 'ID de la suscripción (Mongo ObjectId).',
    example: '65f1c2d3e4f5a6b7c8d9e0b2',
  })
  @ApiOkResponse({
    schema: {
      example: {
        _id: '65f1c2d3e4f5a6b7c8d9e0b2',
        status: 'activo',
      },
    },
  })
  @ApiNotFoundResponse({
    schema: {
      example: {
        status: 404,
        message:
          "No se pudo encontrar la suscripción con id '65f1c2d3e4f5a6b7c8d9e0b2' y por ende no se puede eliminar...",
        error: 'Not found',
      },
    },
  })
  @ApiUnauthorizedResponse({
    schema: { example: { statusCode: 401, message: 'Unauthorized' } },
  })
  @Delete(":suscriptionId/delete-suscription")
  async removeSuscription(@Param("suscriptionId") suscId: string) {
    try {
      const deletedSuscription = await this.suscService.removeSuscriptionById(suscId);
      return ApiResponse.success('Suscripción eliminada correctamente', deletedSuscription);
    } catch (error) {
      return ApiResponse.error(error);
    }
  }
}
