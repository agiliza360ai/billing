import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { PlanesService } from './planes.service';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { CreatePlanDto } from './dto/create-plan.dto';

import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';
import { ApiResponse } from 'src/core/responses/api-response';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Planes')
@Controller('planes')
export class PlanesController {
  constructor(private readonly planesService: PlanesService) {}

  @ApiOperation({
    summary: 'Crear un nuevo plan',
    description:
      'Crea un plan con nombre, precio, moneda, duración, límite de órdenes, features y estado.',
  })
  @ApiBody({
    schema: {
      example: {
        name: 'Plan Pro',
        price: 49.99,
        currency_type: 'USD',
        duration: 'monthly',
        order_limit: 1000,
        features: {
          ai_agent: true,
          priority_support: true,
          carta_digital: true,
          cash_closing: false,
          mass_messaging: true,
          yango_integration: false,
          reservations: true,
          order_module: true,
          dashboard_module: true,
          customer_module: true,
          complaints_module: false,
          kds_module: true,
          multilocals_module: false,
          unlimited_orders: false,
          integrations: true,
          premium_website: false,
        },
        status: 'active',
      },
    },
  })
  @ApiCreatedResponse({
    schema: {
      example: {
        type: '1',
        message: 'Plan creado correctamente',
        statusCode: 201,
        data: {
          _id: '65f1c2d3e4f5a6b7c8d9e0f1',
          name: 'Plan Pro',
          price: 49.99,
          currency_type: 'USD',
          duration: 'monthly',
          order_limit: 1000,
          features: { 
            ai_agent: true, 
            priority_support: true,
            carta_digital: true,
            cash_closing: false,
            mass_messaging: true,
            yango_integration: false,
            reservations: true,
            order_module: true,
            dashboard_module: true,
            customer_module: true,
            complaints_module: false,
            kds_module: true,
            multilocals_module: false,
            unlimited_orders: false,
            integrations: true,
            premium_website: false,
          },
          status: 'active',
          created_at: '2026-01-26T12:00:00.000Z',
          updated_at: '2026-01-26T12:00:00.000Z',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    schema: {
      example: {
        statusCode: 400,
        message: ['price must be a number conforming to the specified constraints'],
        error: 'Bad Request',
      },
    },
  })
  @ApiUnauthorizedResponse({
    schema: { example: { statusCode: 401, message: 'Unauthorized' } },
  })
  @Post("create-plan")
  async createNewPlan(@Body() createData: CreatePlanDto) {
    try {
      const createdPlan = await this.planesService.createPlan(createData);
      return ApiResponse.success('Plan creado correctamente', createdPlan, 201);
    } catch (error) {
      return ApiResponse.error(error);
    }
  }

  @ApiOperation({
    summary: 'Listar planes',
    description: 'Retorna el listado de planes disponibles.',
  })
  @ApiOkResponse({
    schema: {
      example: {
        type: '1',
        message: 'Planes encontrados correctamente',
        statusCode: 200,
        data: [
          {
            _id: '65f1c2d3e4f5a6b7c8d9e0f1',
            name: 'Plan Pro',
            price: 49.99,
            currency_type: 'USD',
            duration: 'monthly',
            order_limit: 1000,
            features: { 
              ai_agent: true, 
              priority_support: true,
              carta_digital: true,
              cash_closing: false,
              mass_messaging: true,
              yango_integration: false,
              reservations: true,
              order_module: true,
              dashboard_module: true,
              customer_module: true,
              complaints_module: false,
              kds_module: true,
              multilocals_module: false,
              unlimited_orders: false,
              integrations: true,
              premium_website: false,
            },
            status: 'active',
            created_at: '2026-01-26T12:00:00.000Z',
            updated_at: '2026-01-26T12:00:00.000Z',
          },
        ],
      },
    },
  })
  @ApiNotFoundResponse({
    schema: {
      example: {
        statusCode: 404,
        message: 'No se pudo encontrar ningun plan.',
        error: 'Not Found',
      },
    },
  })
  @ApiUnauthorizedResponse({
    schema: { example: { statusCode: 401, message: 'Unauthorized' } },
  })
  @Get()
  async findAllPlans() {
    try {
      const foundPlans = await this.planesService.findAllPlans();
      return ApiResponse.success('Planes encontrados correctamente', foundPlans);
    } catch (error) {
      return ApiResponse.error(error);
    }
  }

  @ApiOperation({
    summary: 'Obtener plan por ID',
    description: 'Retorna el detalle de un plan por su `planId`.',
  })
  @ApiParam({
    name: 'planId',
    description: 'ID del plan (Mongo ObjectId).',
    example: '65f1c2d3e4f5a6b7c8d9e0f1',
  })
  @ApiOkResponse({
    schema: {
      example: {
        type: '1',
        message: 'Plan encontrado correctamente',
        statusCode: 200,
        data: {
          _id: '65f1c2d3e4f5a6b7c8d9e0f1',
          name: 'Plan Pro',
          price: 49.99,
          currency_type: 'USD',
          duration: 'monthly',
          order_limit: 1000,
          features: { 
            ai_agent: true, 
            priority_support: true,
            carta_digital: true,
            cash_closing: false,
            mass_messaging: true,
            yango_integration: false,
            reservations: true,
            order_module: true,
            dashboard_module: true,
            customer_module: true,
            complaints_module: false,
            kds_module: true,
            multilocals_module: false,
            unlimited_orders: false,
            integrations: true,
            premium_website: false,
          },
          status: 'active',
          created_at: '2026-01-26T12:00:00.000Z',
          updated_at: '2026-01-26T12:00:00.000Z',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    schema: {
      example: {
        statusCode: 404,
        message: 'No se pudo encontrar el plan del id: 65f1c2d3e4f5a6b7c8d9e0f1',
        error: 'Not Found',
      },
    },
  })
  @ApiUnauthorizedResponse({
    schema: { example: { statusCode: 401, message: 'Unauthorized' } },
  })
  @Get(':planId')
  async findPlan(@Param('planId') id: string) {
    try {
      const foundPlan = await this.planesService.findPlanById(id);
      return ApiResponse.success('Plan encontrado correctamente', foundPlan);
    } catch (error) {
      return ApiResponse.error(error);
    }
  }

  @ApiOperation({
    summary: 'Actualizar plan por ID',
    description: 'Actualiza parcialmente un plan. Solo envía los campos a modificar.',
  })
  @ApiParam({
    name: 'planId',
    description: 'ID del plan (Mongo ObjectId).',
    example: '65f1c2d3e4f5a6b7c8d9e0f1',
  })
  @ApiBody({
    schema: {
      example: {
        price: 59.99,
        duration: 'annual',
        features: { ai_agent: true, priority_support: false },
        status: 'active',
      },
    },
  })
  @ApiOkResponse({
    schema: {
      example: {
        type: '1',
        message: 'Plan actualizado correctamente',
        statusCode: 200,
        data: {
          _id: '65f1c2d3e4f5a6b7c8d9e0f1',
          name: 'Plan Pro',
          price: 59.99,
          currency_type: 'USD',
          duration: 'annual',
          order_limit: 1000,
          features: { 
            ai_agent: true, 
            priority_support: false,
            carta_digital: true,
            cash_closing: false,
            mass_messaging: true,
            yango_integration: false,
            reservations: true,
            order_module: true,
            dashboard_module: true,
            customer_module: true,
            complaints_module: false,
            kds_module: true,
            multilocals_module: false,
            unlimited_orders: false,
            integrations: true,
            premium_website: false,
          },
          status: 'active',
          created_at: '2026-01-26T12:00:00.000Z',
          updated_at: '2026-01-26T13:00:00.000Z',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    schema: {
      example: {
        statusCode: 400,
        message: ['duration must be a valid enum value'],
        error: 'Bad Request',
      },
    },
  })
  @ApiNotFoundResponse({
    schema: {
      example: {
        statusCode: 404,
        message:
          "No se pudo encontrar el plan del id '65f1c2d3e4f5a6b7c8d9e0f1' y por ende no se puede actualizar...",
        error: 'Not Found',
      },
    },
  })
  @ApiUnauthorizedResponse({
    schema: { example: { statusCode: 401, message: 'Unauthorized' } },
  })
  @Patch(':planId/update-plan')
  async updatePlan(
    @Param('planId') id: string,
    @Body() updatePlaneDto: UpdatePlanDto
  ) {
    try {
      const updatedPlan = await this.planesService.findAndUpdateById(id, updatePlaneDto);
      return ApiResponse.success('Plan actualizado correctamente', updatedPlan);
    } catch (error) {
      return ApiResponse.error(error);
    }
  }

  @ApiOperation({
    summary: 'Eliminar todos los planes',
    description: 'Elimina todos los planes existentes y retorna cuántos fueron eliminados.',
  })
  @ApiOkResponse({
    schema: {
      example: {
        type: '1',
        message: 'Planes eliminados correctamente',
        statusCode: 200,
        data: { deletedCount: 5 },
      },
    },
  })
  @ApiNotFoundResponse({
    schema: {
      example: {
        statusCode: 404,
        message: 'No se pudo encontrar ningun plan para eliminar',
        error: 'Not Found',
      },
    },
  })
  @ApiUnauthorizedResponse({
    schema: { example: { statusCode: 401, message: 'Unauthorized' } },
  })
  @Delete("delete-all-plans")
  async removeAllPlans() {
    try {
      const deletedPlans = await this.planesService.removeAllPlans();
      return ApiResponse.success('Planes eliminados correctamente', deletedPlans);
    } catch (error) {
      return ApiResponse.error(error);
    }
  }

  @ApiOperation({
    summary: 'Eliminar múltiples planes',
    description: 'Elimina múltiples planes enviando un array de IDs (Mongo ObjectId).',
  })
  @ApiBody({
    schema: {
      type: 'array',
      items: { type: 'string' },
      example: ['65f1c2d3e4f5a6b7c8d9e0f1', '65f1c2d3e4f5a6b7c8d9e0f2'],
    },
  })
  @ApiOkResponse({
    schema: {
      example: {
        type: '1',
        message: 'Planes eliminados correctamente',
        statusCode: 200,
        data: { deletedCount: 2 },
      },
    },
  })
  @ApiBadRequestResponse({
    schema: {
      example: {
        statusCode: 400,
        message: 'Debe proporcionar al menos un ID para eliminar.',
        error: 'Bad Request',
      },
    },
  })
  @ApiNotFoundResponse({
    schema: {
      example: {
        statusCode: 404,
        message: 'No se pudo encontrar ningun plan para eliminar',
        error: 'Not Found',
      },
    },
  })
  @ApiUnauthorizedResponse({
    schema: { example: { statusCode: 401, message: 'Unauthorized' } },
  })
  @Delete("delete-many-plans")
  async removeManyPlans(@Body() planIds: string[]) {
    try {
      const deletedPlans = await this.planesService.removeManyPlansById(planIds);
      return ApiResponse.success('Planes eliminados correctamente', deletedPlans);
    } catch (error) {
      return ApiResponse.error(error);
    }
  }

  @ApiOperation({
    summary: 'Eliminar plan por ID',
    description: 'Elimina un plan específico por su `planId` y retorna el documento eliminado.',
  })
  @ApiParam({
    name: 'planId',
    description: 'ID del plan (Mongo ObjectId).',
    example: '65f1c2d3e4f5a6b7c8d9e0f1',
  })
  @ApiOkResponse({
    schema: {
      example: {
        type: '1',
        message: 'Plan eliminado correctamente',
        statusCode: 200,
        data: {
          _id: '65f1c2d3e4f5a6b7c8d9e0f1',
          name: 'Plan Pro',
          price: 49.99,
          currency_type: 'USD',
          duration: 'monthly',
          order_limit: 1000,
          features: { 
            ai_agent: true, 
            priority_support: true,
            carta_digital: true,
            cash_closing: false,
            mass_messaging: true,
            yango_integration: false,
            reservations: true,
            order_module: true,
            dashboard_module: true,
            customer_module: true,
            complaints_module: false,
            kds_module: true,
            multilocals_module: false,
            unlimited_orders: false,
            integrations: true,
            premium_website: false,
          },
          status: 'active',
          created_at: '2026-01-26T12:00:00.000Z',
          updated_at: '2026-01-26T12:00:00.000Z',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    schema: {
      example: {
        statusCode: 404,
        message: "No se pudo encontrar el plan con id '65f1c2d3e4f5a6b7c8d9e0f1' y por ende no se puede eliminar...",
        error: 'Not Found',
      },
    },
  })
  @ApiUnauthorizedResponse({
    schema: { example: { statusCode: 401, message: 'Unauthorized' } },
  })
  @Delete(':planId/delete-plan')
  async removePlan(@Param('planId') planId: string) {
    try {
      const deletedPlan = await this.planesService.removePlanById(planId);
      return ApiResponse.success('Plan eliminado correctamente', deletedPlan);
    } catch (error) {
      return ApiResponse.error(error);
    }
  }
}
