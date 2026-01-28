import { PartialType } from '@nestjs/swagger';
import { OfferBaseDto } from './create-offer.dto';
import { OnlyDiscountOrExtraDuration } from 'src/core/decorators/offer.decorator';

export class UpdateOfferDto extends PartialType(OfferBaseDto) {
  // En UPDATE: permitir ninguno, pero nunca ambos simultáneamente
  @OnlyDiscountOrExtraDuration({ allowNeither: true })
  private readonly _offerChoiceValidation!: string;
}
