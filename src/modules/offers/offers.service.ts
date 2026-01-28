import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';

import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Offer, OfferDocument } from './entities/offer.entity';
import { DeleteResponse } from 'src/types/reponses';

@Injectable()
export class OffersService {
  constructor(
    @InjectModel(Offer.name) private offerModel: Model<OfferDocument>
  ) {}

  private validateOfferChoice(
    input: { discount?: any; extra_duration_plan?: any },
    opts: { requireExactlyOne?: boolean } = {},
  ) {
    const hasDiscount = input.discount !== undefined && input.discount !== null;
    const hasExtra = input.extra_duration_plan !== undefined && input.extra_duration_plan !== null;

    if (hasDiscount && hasExtra) {
      throw new BadRequestException(
        "No puedes enviar `discount` y `extra_duration_plan` al mismo tiempo."
      );
    }

    if (opts.requireExactlyOne && !hasDiscount && !hasExtra) {
      throw new BadRequestException(
        "Debes enviar SOLO `discount` o SOLO `extra_duration_plan` (uno de los dos es obligatorio)."
      );
    }
  }

  async createOffer(createOfferDto: CreateOfferDto): Promise<Offer> {
    // Defensa extra por si alguien llama el service sin pasar por ValidationPipe
    this.validateOfferChoice(createOfferDto, { requireExactlyOne: true });
    const createdOffer = new this.offerModel(createOfferDto);
    return createdOffer.save();
  }

  async findAllOffers(): Promise<Offer[]> {
    const foundOffers = await this.offerModel.find().exec();
    if (!foundOffers || foundOffers.length === 0) {
      throw new NotFoundException("No se pudo encontrar ninguna oferta");
    }
    return foundOffers;
  }

  async findOfferById(id: string): Promise<Offer> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`No se pudo encontrar la oferta con id: ${id}`);
    }

    const foundOffer = await this.offerModel.findById(id).exec();
    if (!foundOffer || foundOffer === null || undefined) {
      throw new NotFoundException(`No se pudo encontrar la oferta con id: ${id}`);
    }
    return foundOffer;
  }

  async updateOfferById(id: string, updateOfferDto: UpdateOfferDto): Promise<Offer> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`No se pudo encontrar la oferta del id '${id}' y por ende no se puede actualizar...`);
    }

    this.validateOfferChoice(updateOfferDto);

    const updatedOffer = await this.offerModel
      .findByIdAndUpdate(
        id,
        updateOfferDto,
        { new: true, runValidators: true }
      )
      .exec();

    if (!updatedOffer || updatedOffer === null || undefined) {
      throw new NotFoundException(`No se pudo encontrar la oferta del id '${id}' y por ende no se puede actualizar...`);
    }
    return updatedOffer;
  }

  async removeOfferById(id: string): Promise<Offer> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`No se pudo encontrar la oferta del id '${id}' y por ende no se puede eliminar...`);
    }

    const removedOffer = await this.offerModel
      .findByIdAndDelete(id)
      .exec();

    if (!removedOffer || removedOffer === null || undefined) {
      throw new NotFoundException(`No se pudo encontrar la oferta del id '${id}' y por ende no se puede eliminar...`);
    }
    return removedOffer;
  }

  async removeAllOffers(): Promise<DeleteResponse> {
    const { deletedCount } = await this.offerModel.deleteMany().exec();
    if (deletedCount === 0) {
      throw new NotFoundException("No se pudo encontrar ninguna oferta para eliminar");
    }
    return { deletedCount };
  }

  // create(createOfferDto: CreateOfferDto) {
  //   return 'This action adds a new offer';
  // }

  // findAll() {
  //   return `This action returns all offers`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} offer`;
  // }

  // update(id: number, updateOfferDto: UpdateOfferDto) {
  //   return `This action updates a #${id} offer`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} offer`;
  // }
}
