import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSuscripcionDto } from './dto/create-suscripcion.dto';

import { InjectModel } from '@nestjs/mongoose';
import { DeleteResult, Model, Types } from "mongoose";

import { Suscripcion, SuscripcionDocument } from './entities/suscripcion.entity';
import { UpdateSuscripcionDto } from './dto/update-suscripcion.dto';
import { PagosService } from '../pagos/pagos.service';
import { PlanesService } from '../planes/planes.service';
import { OffersService } from '../offers/offers.service';
import { OfferExtraDurationType } from 'src/types/enums';

@Injectable()
export class SuscripcionesService {
  constructor(
    @InjectModel(Suscripcion.name) private suscModel: Model<SuscripcionDocument>,
    private readonly pagosService: PagosService,
    private readonly planesService: PlanesService,
    private readonly offersService: OffersService,
  ) { }

  async createSuscriptionToPlan(suscripcionData: CreateSuscripcionDto): Promise<Suscripcion> {
    // Obtener el plan para calcular la fecha de renovación
    const plan = await this.planesService.findPlanById(suscripcionData.planId);

    // Calcular la fecha de inicio (por defecto: fecha actual)
    const startDate = suscripcionData.start_date || new Date();

    // Resolver oferta (si se envía)
    let offerId: string | undefined;
    let extraDuration: { amount: number; type: OfferExtraDurationType } | null = null;

    if (suscripcionData.offerId) {
      const foundOffer = await this.offersService.findOfferById(suscripcionData.offerId);
      offerId = foundOffer._id.toString();
      const extraAmount = Number(foundOffer.extra_duration_plan?.extra_duration || 0);
      const extraType = foundOffer.extra_duration_plan?.duration_type as OfferExtraDurationType | undefined;
      if (extraAmount > 0 && extraType) {
        extraDuration = { amount: extraAmount, type: extraType };
      }
    }

    // Calcular automáticamente la fecha de renovación basada en la duración del plan.
    // Nota: aunque el cliente envíe `renovate_date`, el backend recalcula para evitar inconsistencias
    // y luego aplica la oferta (si existe).
    let renovateDate: Date = this.calculateRenovateDate(startDate, plan.duration);

    // Aplicar duración extra de oferta (según unidad) encima de la duración base del plan
    if (extraDuration) {
      renovateDate = this.applyOfferExtraDuration(renovateDate, extraDuration);
    }

    // Crear la suscripción con la fecha de renovación calculada
    const suscripcionToSave = {
      ...suscripcionData,
      brandId: suscripcionData.brandId,
      planId: suscripcionData.planId,
      start_date: startDate,
      renovate_date: renovateDate,
      ...(offerId ? { offerId: offerId } : {}),
    };

    const createdSuscription = new this.suscModel(suscripcionToSave);
    const savedSuscription = await createdSuscription.save();

    // Crear automáticamente un pago asociado a la suscripción
    // Ya que una suscripción técnicamente es cuando alguien paga un servicio
    const fechaPago = startDate;

    const pago = {
      brandId: suscripcionData.brandId,
      suscriptionId: savedSuscription._id.toString(),
      status: "pendiente",
      fecha_pago: fechaPago,
      voucher_pago: "",
      notas: []
    }

    const tipoPago = suscripcionData.tipo_pago;
    const paymentData = { ...pago, tipo_pago: tipoPago }

    let paymentDataWithProvider: any;

    if (tipoPago === "transferencia") {
      paymentDataWithProvider = { ...paymentData, transferencia: suscripcionData.provider };
    }
    if (tipoPago === "billetera_digital") {
      paymentDataWithProvider = { ...paymentData, billetera_digital: suscripcionData.provider };
    }
    if (tipoPago === "pago_link") {
      paymentDataWithProvider = { ...paymentData, pago_link: suscripcionData.provider };
    }

    await this.pagosService.registerPayment(paymentDataWithProvider)
    return savedSuscription;
  }

  /**
   * Calcula la fecha de renovación basada en la fecha de inicio y la duración del plan
   */
  private calculateRenovateDate(startDate: Date, duration: string): Date {
    const renovateDate = new Date(startDate);

    switch (duration) {
      case 'monthly':
        // Plan mensual: +1 mes
        renovateDate.setMonth(renovateDate.getMonth() + 1);
        break;
      case 'annual':
        // Plan anual: +1 año
        renovateDate.setFullYear(renovateDate.getFullYear() + 1);
        break;
      case 'semester':
        // Plan semestral: +6 meses
        renovateDate.setMonth(renovateDate.getMonth() + 6);
        break;
      case 'quarter':
        // Plan trimestral: +3 meses
        renovateDate.setMonth(renovateDate.getMonth() + 3);
        break;
      case 'biweekly':
        // Plan quincenal: +15 días
        renovateDate.setDate(renovateDate.getDate() + 15);
        break;
      default:
        // Por defecto: +1 mes
        renovateDate.setMonth(renovateDate.getMonth() + 1);
        break;
    }

    return renovateDate;
  }

  /**
   * Aplica la duración extra de una oferta a una fecha.
   * - days: suma N días
   * - weeks: suma N * 7 días
   * - months: suma N meses
   * - years: suma N años
   */
  private applyOfferExtraDuration(
    baseDate: Date,
    extra: { amount: number; type: OfferExtraDurationType },
  ): Date {
    const d = new Date(baseDate);
    const amount = Number(extra.amount || 0);
    if (amount <= 0) return d;

    switch (extra.type) {
      case OfferExtraDurationType.DAYS:
        d.setDate(d.getDate() + amount);
        break;
      case OfferExtraDurationType.WEEKS:
        d.setDate(d.getDate() + amount * 7);
        break;
      case OfferExtraDurationType.MONTHS:
        d.setMonth(d.getMonth() + amount);
        break;
      default:
        // fallback seguro: días
        d.setDate(d.getDate() + amount);
        break;
    }
    return d;
  }

  async getAllSuscriptions(
    planId?: string,
    brandId?: string
  ): Promise<Suscripcion | Suscripcion[]> {
    // Validar que no se usen múltiples criterios
    const paramsCount = [planId, brandId].filter(p => p).length;
    if (paramsCount > 1) {
      throw new BadRequestException({
        status: 400,
        message: "Use solo un criterio de búsqueda: id, planId o brandId",
        error: "Bad request"
      });
    }

    if (planId) return await this.getSuscriptionByPlanId(planId);
    if (brandId) return await this.getSuscriptionByBrandId(brandId);

    const foundSuscriptions = await this.suscModel
      .find()
      .populate({ path: "brandId", select: "name logo" })
      .populate({ path: "planId", select: "name price" })
      .populate({ path: "offerId", select: "offer_name description discount extra_duration_plan status" })
      .exec();
    if (!foundSuscriptions || foundSuscriptions.length === 0) {
      throw new NotFoundException({
        status: 404,
        message: "No se pudo encontrar ninguna suscripción",
        error: "Not found"
      });
    }
    return foundSuscriptions;
  }

  async getSuscriptionById(id: string): Promise<Suscripcion> {
    // Validar ObjectId
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException({
        status: 404,
        message: `Suscripción con ID ${id} no encontrada`,
        error: "Not found"
      });
    }

    const foundSuscription = await this.suscModel
      .findById(id)
      .populate({ path: "brandId", select: "name logo" })
      .populate({ path: "planId", select: "name price" })
      .populate({ path: "offerId", select: "offer_name description discount extra_duration_plan status" });
    if (!foundSuscription || foundSuscription === null || undefined) {
      throw new NotFoundException({
        status: 404,
        message: `No se pudo encontrar la suscripción con id: ${id}`,
        error: "Not found"
      });
    }
    return foundSuscription;
  }

  async getSuscriptionByPlanId(planId: string): Promise<Suscripcion | Suscripcion[]> {
    // Validar y convertir planId a ObjectId
    if (!Types.ObjectId.isValid(planId)) {
      throw new NotFoundException({
        status: 404,
        message: `PlanId inválido: ${planId}`,
        error: "Not found"
      });
    }
    const planIdObjectId = new Types.ObjectId(planId);

    const foundSuscription = await this.suscModel
      .find({ planId: planIdObjectId })
      .populate({ path: "brandId", select: "name logo" })
      .populate({ path: "planId", select: "name price" })
      .populate({ path: "offerId", select: "offer_name description discount extra_duration_plan status" });

    if (!foundSuscription || foundSuscription === null || undefined) {
      throw new NotFoundException({
        status: 404,
        message: `No se pudo encontrar la suscripción que tiene el plan con id: ${planId}`,
        error: "Not found"
      });
    }
    return foundSuscription;
  }

  async getSuscriptionByBrandId(brandId: string): Promise<Suscripcion | Suscripcion[]> {
    // Validar y convertir brandId a ObjectId
    if (!Types.ObjectId.isValid(brandId)) {
      throw new NotFoundException({
        status: 404,
        message: `BrandId inválido: ${brandId}`,
        error: "Not found"
      });
    }
    const brandIdObjectId = new Types.ObjectId(brandId);

    const foundSuscription = await this.suscModel
      .find({ brandId: brandIdObjectId })
      .populate({ path: "brandId", select: "name logo" })
      .populate({ path: "planId", select: "name price" })
      .populate({ path: "offerId", select: "offer_name description discount extra_duration_plan status" });
    if (!foundSuscription || foundSuscription === null || undefined) {
      throw new NotFoundException({
        status: 404,
        message: `No se pudo encontrar la suscripción de la marca con id: ${brandId}`,
        error: "Not found"
      });
    }
    return foundSuscription;
  }

  async findAndUpdateSuscriptionById(
    suscriptionId: string,
    updateData: UpdateSuscripcionDto
  ): Promise<Suscripcion> {
    if (!Types.ObjectId.isValid(suscriptionId)) {
      throw new NotFoundException({
        status: 404,
        message: `No se pudo encontrar la suscripción del id '${suscriptionId}' y por ende no se puede actualizar...`,
        error: "Not found"
      });
    }

    const updatedSuscription = await this.suscModel
      .findByIdAndUpdate(
        suscriptionId,
        updateData,
        { new: true }
      )
      .exec();

    if (!updatedSuscription) {
      throw new NotFoundException({
        status: 404,
        message: `No se pudo encontrar la suscripción del id '${suscriptionId}' y por ende no se puede actualizar...`,
        error: "Not found"
      });
    }
    return updatedSuscription;
  }

  async removeAllSuscriptions(
    planId?: string,
    brandId?: string
  ): Promise<DeleteResult> {
    if (brandId) return await this.removeSuscriptionsByBrandId(brandId);
    if (planId) return await this.removeSuscriptionsByPlanId(planId);

    const deletedResult = await this.suscModel
      .deleteMany()
      .exec();

    if (!deletedResult) {
      throw new NotFoundException({
        status: 404,
        message: "No se pudo encontrar ninguna suscripción, por ende no hay nada que borrar",
        error: "Not found"
      });
    }
    return deletedResult;
  }

  async removeSuscriptionById(suscId: string): Promise<Suscripcion> {
    if (!Types.ObjectId.isValid(suscId)) {
      throw new NotFoundException({
        status: 404,
        message: `No se pudo encontrar la suscripción con id '${suscId}' y por ende no se puede eliminar...`,
        error: "Not found"
      });
    }

    const removedSuscription = await this.suscModel
      .findByIdAndDelete(suscId)
      .exec();

    if (!removedSuscription) {
      throw new NotFoundException({
        status: 404,
        message: `No se pudo encontrar la suscripción con id '${suscId}' y por ende no se puede eliminar...`,
        error: "Not found"
      });
    }
    return removedSuscription;
  }

  async removeSuscriptionsByPlanId(planId: string) {
    // Validar y convertir planId a ObjectId
    if (!Types.ObjectId.isValid(planId)) {
      throw new NotFoundException({
        status: 404,
        message: `PlanId inválido: ${planId}`,
        error: "Not found"
      });
    }
    const planIdObjectId = new Types.ObjectId(planId);

    const deletedResult = await this.suscModel.deleteMany({
      planId: planIdObjectId
    });

    if (!deletedResult) {
      throw new NotFoundException({
        status: 404,
        message: `No se pudo encontrar ninguna suscripción con el planId ${planId}, por ende no hay nada que borrar`,
        error: "Not found"
      });
    }
    return deletedResult;
  }

  async removeSuscriptionsByBrandId(brandId: string): Promise<DeleteResult> {
    // Validar y convertir brandId a ObjectId
    if (!Types.ObjectId.isValid(brandId)) {
      throw new NotFoundException({
        status: 404,
        message: `BrandId inválido: ${brandId}`,
        error: "Not found"
      });
    }
    const brandIdObjectId = new Types.ObjectId(brandId);

    const deletedResult = await this.suscModel.deleteMany({
      brandId: brandIdObjectId
    });
    if (!deletedResult) {
      throw new NotFoundException({
        status: 404,
        message: `No se pudo encontrar ninguna suscripción con el brandId ${brandId}, por ende no hay nada que borrar`,
        error: "Not found"
      });
    }
    return deletedResult;
  }
}
