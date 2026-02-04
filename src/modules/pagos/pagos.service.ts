import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';

import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from "mongoose";

import { Pago, PagosDocument } from './entities/pago.entity';
import { DeleteResponse, DeleteVoucherResponse } from 'src/types/reponses';
import { CloudinaryService } from 'src/core/cloudinary/image.service';

@Injectable()
export class PagosService {
  constructor(
    @InjectModel(Pago.name) private readonly pagosModel: Model<PagosDocument>,
    private readonly cloudinaryService: CloudinaryService
  ) { }

  async registerPayment(registerData: CreatePagoDto): Promise<Pago> {
    // Convertir brandId y suscriptionId a ObjectId para asegurar compatibilidad con MongoDB
    const paymentData = {
      ...registerData,
      brandId: new Types.ObjectId(registerData.brandId),
      suscriptionId: new Types.ObjectId(registerData.suscriptionId),
    };
    const registedPayment = new this.pagosModel(paymentData);
    return registedPayment.save();
  }

  async findAllPayments(): Promise<Pago[]> {
    const foundPayments = await this.pagosModel
      .find()
      .populate({ path: 'brandId', select: 'name' })
      .populate({
        path: "suscriptionId",
        select: "planId",
        populate: { path: "planId", select: "name" }
      })
      .exec();
    if (!foundPayments || foundPayments.length === 0) {
      throw new NotFoundException("No se pudo encontrar ningun pago");
    }
    return foundPayments;
  }

  async findPaymentById(id: string): Promise<Pago> {
    const foundPayment = await this.pagosModel.findById(id).exec();
    if (!foundPayment || foundPayment === null || undefined) {
      throw new NotFoundException(`No se pudo encontrar el pago con id: ${id}`);
    }
    return foundPayment;
  }

  async findAndUpdateById(
    paymentId: string,
    updateData: UpdatePagoDto
  ): Promise<Pago> {
    if (!Types.ObjectId.isValid(paymentId)) {
      throw new NotFoundException(`No se pudo encontrar el pago del id '${paymentId}' y por ende no se puede actualizar...`);
    }

    const updatedPayment = await this.pagosModel
      .findByIdAndUpdate(
        paymentId,
        updateData,
        { new: true }
      )
      .exec();

    if (!updatedPayment) {
      throw new NotFoundException(`No se pudo encontrar el pago del id '${paymentId}' y por ende no se puede actualizar...`);
    }
    return updatedPayment;
  }

  async removePaymentById(paymentId: string): Promise<Pago> {
    if (!Types.ObjectId.isValid(paymentId)) {
      throw new NotFoundException(`No se pudo encontrar el pago con id '${paymentId}' y por ende no se puede eliminar...`);
    }

    const removedPayment = await this.pagosModel
      .findByIdAndDelete(paymentId)
      .exec();

    if (!removedPayment) {
      throw new NotFoundException(`No se pudo encontrar el pago con id '${paymentId}' y por ende no se puede eliminar...`);
    }
    return removedPayment;
  }

  async removeAllPayments(): Promise<DeleteResponse> {
    const { deletedCount } = await this.pagosModel.deleteMany().exec();
    if (deletedCount === 0) {
      throw new NotFoundException("No se pudo encontrar ningun pago para eliminar");
    }
    return { deletedCount };
  }

  async uploadVoucherPayment(
    paymentId: string,
    voucherFile: Express.Multer.File
  ): Promise<Pago> {
    const voucherPhotoUrl = await this.cloudinaryService.uploadImage(voucherFile);
    const updatedPayment = await this.findAndUpdateById(
      paymentId,
      { voucher_pago: voucherPhotoUrl }
    );
    return updatedPayment;
  }

  async deleteVoucher(paymentId: string): Promise<DeleteVoucherResponse> {
    const { voucher_pago } = await this.findPaymentById(paymentId);

    if (!voucher_pago || voucher_pago === "") {
      throw new NotFoundException("Not found voucher")
    }

    await this.cloudinaryService.deleteImage(voucher_pago);
    await this.findAndUpdateById(
      paymentId,
      { voucher_pago: null }
    );

    return {
      deleteVoucher: true,
      voucherUrl: voucher_pago || "",
    };
  }
}
