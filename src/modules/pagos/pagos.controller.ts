import { Body, Controller, Delete, Get, Param, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { PagosService } from './pagos.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';
import { ApiResponse } from 'src/core/responses/api-response';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
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
@ApiTags('Pagos')
@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) { }

  @ApiOperation({
    summary: 'Registrar un pago',
    description:
      'Registra un pago asociado a una marca y una suscripción. Algunos campos dependen de `tipo_pago` (transferencia, billetera_digital o pago_link).',
  })
  @ApiBody({
    schema: {
      example: {
        brandId: '65f1c2d3e4f5a6b7c8d9e0a1',
        suscriptionId: '65f1c2d3e4f5a6b7c8d9e0b2',
        tipo_pago: 'transferencia',
        transferencia: 'BCP - Cuenta 123-456-789',
        voucher_pago: null,
        notas: ['Pago por suscripción anual'],
        status: 'pendiente',
        fecha_pago: '2026-01-26T12:00:00.000Z',
      },
    },
  })
  @ApiCreatedResponse({
    schema: {
      example: {
        type: '1',
        message: 'Pago registrado correctamente',
        statusCode: 201,
        data: {
          _id: '65f1c2d3e4f5a6b7c8d9e0c3',
          brandId: '65f1c2d3e4f5a6b7c8d9e0a1',
          suscriptionId: '65f1c2d3e4f5a6b7c8d9e0b2',
          tipo_pago: 'transferencia',
          transferencia: 'BCP - Cuenta 123-456-789',
          voucher_pago: '',
          fecha_pago: '2026-01-26T12:00:00.000Z',
          notas: ['Pago por suscripción anual'],
          status: 'pendiente',
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
        message: ['status es requerido'],
        error: 'Bad Request',
      },
    },
  })
  @ApiUnauthorizedResponse({
    schema: { example: { statusCode: 401, message: 'Unauthorized' } },
  })
  @Post("register-payment")
  async registerPayment(@Body() registerData: CreatePagoDto) {
    try {
      const registedPayment = await this.pagosService.registerPayment(registerData);
      return ApiResponse.success('Pago registrado correctamente', registedPayment, 201);
    } catch (error) {
      return ApiResponse.error(error);
    }
  }

  @ApiOperation({
    summary: 'Listar pagos',
    description:
      'Retorna el listado de pagos. Incluye populates de `brandId` y `suscriptionId/planId` según el service.',
  })
  @ApiOkResponse({
    schema: {
      example: {
        type: '1',
        message: 'Pagos encontrados correctamente',
        statusCode: 200,
        data: [
          {
            _id: '65f1c2d3e4f5a6b7c8d9e0c3',
            brandId: { _id: '65f1c2d3e4f5a6b7c8d9e0a1', name: 'Brand Demo' },
            suscriptionId: {
              _id: '65f1c2d3e4f5a6b7c8d9e0b2',
              planId: { _id: '65f1c2d3e4f5a6b7c8d9e0f1', name: 'Plan Pro' },
            },
            tipo_pago: 'transferencia',
            transferencia: 'BCP - Cuenta 123-456-789',
            voucher_pago: '',
            fecha_pago: '2026-01-26T12:00:00.000Z',
            notas: ['Pago por suscripción anual'],
            status: 'pendiente',
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
        message: 'No se pudo encontrar ningun pago',
        error: 'Not Found',
      },
    },
  })
  @ApiUnauthorizedResponse({
    schema: { example: { statusCode: 401, message: 'Unauthorized' } },
  })
  @Get()
  async findAllPayment() {
    try {
      const foundPayments = await this.pagosService.findAllPayments();
      return ApiResponse.success('Pagos encontrados correctamente', foundPayments);
    } catch (error) {
      return ApiResponse.error(error);
    }
  }

  @ApiOperation({
    summary: 'Obtener pago por ID',
    description: 'Retorna el detalle de un pago por su `paymentId`.',
  })
  @ApiParam({
    name: 'paymentId',
    description: 'ID del pago (Mongo ObjectId).',
    example: '65f1c2d3e4f5a6b7c8d9e0c3',
  })
  @ApiOkResponse({
    schema: {
      example: {
        type: '1',
        message: 'Pago encontrado correctamente',
        statusCode: 200,
        data: {
          _id: '65f1c2d3e4f5a6b7c8d9e0c3',
          brandId: '65f1c2d3e4f5a6b7c8d9e0a1',
          suscriptionId: '65f1c2d3e4f5a6b7c8d9e0b2',
          tipo_pago: 'transferencia',
          transferencia: 'BCP - Cuenta 123-456-789',
          voucher_pago: '',
          fecha_pago: '2026-01-26T12:00:00.000Z',
          notas: ['Pago por suscripción anual'],
          status: 'pendiente',
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
        message: 'No se pudo encontrar el pago con id: 65f1c2d3e4f5a6b7c8d9e0c3',
        error: 'Not Found',
      },
    },
  })
  @ApiUnauthorizedResponse({
    schema: { example: { statusCode: 401, message: 'Unauthorized' } },
  })
  @Get(":paymentId")
  async findPayment(@Param("paymentId") paymentId: string) {
    try {
      const foundPayment = await this.pagosService.findPaymentById(paymentId);
      return ApiResponse.success('Pago encontrado correctamente', foundPayment);
    } catch (error) {
      return ApiResponse.error(error);
    }
  }

  @ApiOperation({
    summary: 'Actualizar pago por ID',
    description: 'Actualiza parcialmente un pago. Solo envía los campos a modificar.',
  })
  @ApiParam({
    name: 'paymentId',
    description: 'ID del pago (Mongo ObjectId).',
    example: '65f1c2d3e4f5a6b7c8d9e0c3',
  })
  @ApiBody({
    schema: {
      example: {
        status: 'completado',
        notas: ['Pago confirmado por administración'],
      },
    },
  })
  @ApiOkResponse({
    schema: {
      example: {
        type: '1',
        message: 'Pago actualizado correctamente',
        statusCode: 200,
        data: {
          _id: '65f1c2d3e4f5a6b7c8d9e0c3',
          status: 'completado',
          notas: ['Pago confirmado por administración'],
          updated_at: '2026-01-26T13:00:00.000Z',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    schema: {
      example: {
        statusCode: 404,
        message:
          "No se pudo encontrar el pago del id '65f1c2d3e4f5a6b7c8d9e0c3' y por ende no se puede actualizar...",
        error: 'Not Found',
      },
    },
  })
  @ApiUnauthorizedResponse({
    schema: { example: { statusCode: 401, message: 'Unauthorized' } },
  })
  @Patch(":paymentId/update-payment")
  async updatePayment(
    @Param("paymentId") paymentId: string,
    @Body() updatePagoDto: UpdatePagoDto
  ) {
    try {
      const updatedPayment = await this.pagosService.findAndUpdateById(
        paymentId,
        updatePagoDto
      );
      return ApiResponse.success('Pago actualizado correctamente', updatedPayment);
    } catch (error) {
      return ApiResponse.error(error);
    }
  }

  @ApiOperation({
    summary: 'Subir voucher de pago',
    description:
      'Sube un archivo (campo `voucher`) y lo asocia al pago. Internamente se sube a Cloudinary.',
  })
  @ApiParam({
    name: 'paymentId',
    description: 'ID del pago (Mongo ObjectId).',
    example: '65f1c2d3e4f5a6b7c8d9e0c3',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        voucher: { type: 'string', format: 'binary' },
      },
      required: ['voucher'],
    },
  })
  @ApiOkResponse({
    schema: {
      example: {
        type: '1',
        message: 'Voucher subido correctamente',
        statusCode: 200,
        data: {
          _id: '65f1c2d3e4f5a6b7c8d9e0c3',
          voucher_pago: 'https://res.cloudinary.com/demo/image/upload/voucher.png',
          updated_at: '2026-01-26T13:10:00.000Z',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    schema: {
      example: {
        statusCode: 404,
        message:
          "No se pudo encontrar el pago del id '65f1c2d3e4f5a6b7c8d9e0c3' y por ende no se puede actualizar...",
        error: 'Not Found',
      },
    },
  })
  @ApiUnauthorizedResponse({
    schema: { example: { statusCode: 401, message: 'Unauthorized' } },
  })
  @Patch(":paymentId/upload-voucher")
  @UseInterceptors(FileInterceptor("voucher"))
  async uploadVoucherPayment(
    @Param("paymentId") paymentId: string,
    @UploadedFile() voucherFile: Express.Multer.File
  ) {
    try {
      const paymentWithVoucher = await this.pagosService.uploadVoucherPayment(
        paymentId,
        voucherFile
      );
      return ApiResponse.success('Voucher subido correctamente', paymentWithVoucher);
    } catch (error) {
      return ApiResponse.error(error);
    }
  }

  @ApiOperation({
    summary: 'Eliminar voucher de pago',
    description: 'Elimina el voucher asociado al pago (incluye borrado en Cloudinary).',
  })
  @ApiParam({
    name: 'paymentId',
    description: 'ID del pago (Mongo ObjectId).',
    example: '65f1c2d3e4f5a6b7c8d9e0c3',
  })
  @ApiOkResponse({
    schema: {
      example: {
        type: '1',
        message: 'Voucher eliminado correctamente',
        statusCode: 200,
        data: {
          deleteVoucher: true,
          voucherUrl: 'https://res.cloudinary.com/demo/image/upload/voucher.png',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    schema: {
      example: { statusCode: 404, message: 'Not found voucher', error: 'Not Found' },
    },
  })
  @ApiUnauthorizedResponse({
    schema: { example: { statusCode: 401, message: 'Unauthorized' } },
  })
  @Delete(":paymentId/delete-voucher")
  async deleteVoucher(@Param("paymentId") paymentId: string) {
    try {
      const deletedVoucher = await this.pagosService.deleteVoucher(paymentId);
      return ApiResponse.success('Voucher eliminado correctamente', deletedVoucher);
    } catch (error) {
      return ApiResponse.error(error);
    }
  }

  @ApiOperation({
    summary: 'Eliminar todos los pagos',
    description: 'Elimina todos los pagos y retorna cuántos fueron eliminados.',
  })
  @ApiOkResponse({
    schema: {
      example: {
        type: '1',
        message: 'Pagos eliminados correctamente',
        statusCode: 200,
        data: { deletedCount: 10 },
      },
    },
  })
  @ApiNotFoundResponse({
    schema: {
      example: {
        statusCode: 404,
        message: 'No se pudo encontrar ningun pago para eliminar',
        error: 'Not Found',
      },
    },
  })
  @ApiUnauthorizedResponse({
    schema: { example: { statusCode: 401, message: 'Unauthorized' } },
  })
  @Delete("delete-all-payments")
  async removeAllPayments() {
    try {
      const deletedPayments = await this.pagosService.removeAllPayments();
      return ApiResponse.success('Pagos eliminados correctamente', deletedPayments);
    } catch (error) {
      return ApiResponse.error(error);
    }
  }

  @ApiOperation({
    summary: 'Eliminar pago por ID',
    description: 'Elimina un pago específico por su `paymentId` y retorna el documento eliminado.',
  })
  @ApiParam({
    name: 'paymentId',
    description: 'ID del pago (Mongo ObjectId).',
    example: '65f1c2d3e4f5a6b7c8d9e0c3',
  })
  @ApiOkResponse({
    schema: {
      example: {
        type: '1',
        message: 'Pago eliminado correctamente',
        statusCode: 200,
        data: {
          _id: '65f1c2d3e4f5a6b7c8d9e0c3',
          status: 'pendiente',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    schema: {
      example: {
        statusCode: 404,
        message:
          "No se pudo encontrar el pago con id '65f1c2d3e4f5a6b7c8d9e0c3' y por ende no se puede eliminar...",
        error: 'Not Found',
      },
    },
  })
  @ApiUnauthorizedResponse({
    schema: { example: { statusCode: 401, message: 'Unauthorized' } },
  })
  @Delete(":paymentId/delete-payment")
  async removePayment(@Param("paymentId") paymentId: string) {
    try {
      const deletedPayment = await this.pagosService.removePaymentById(paymentId);
      return ApiResponse.success('Pago eliminado correctamente', deletedPayment);
    } catch (error) {
      return ApiResponse.error(error);
    }
  }
}
