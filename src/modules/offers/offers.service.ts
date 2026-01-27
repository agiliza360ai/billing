import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Offer, OfferDocument } from './entities/offer.entity';

@Injectable()
export class OffersService {
  constructor(
    @InjectModel(Offer.name) private offerModel: Model<OfferDocument>
  ) {}

  async createOffer(createOfferDto: CreateOfferDto): Promise<Offer> {
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
