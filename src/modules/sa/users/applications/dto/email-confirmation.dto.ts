import { randomUUID } from 'crypto';
import { add } from 'date-fns';
import { settings } from '../../../../../settings';

export class EmailConfirmationDto {
  isConfirmed: boolean;
  confirmationCode?: string;
  expirationDate?: string;

  constructor(isConfirmed: boolean) {
    this.isConfirmed = isConfirmed;
    this.confirmationCode = !isConfirmed ? randomUUID() : null;
    this.expirationDate = !isConfirmed
      ? add(new Date(), {
          hours: Number(settings.timeLife.CONFIRMATION_CODE),
        }).toISOString()
      : null;
  }
}
