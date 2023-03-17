import {SqlEmailConfirmation} from "./modules/public/auth/infrastructure/sql/entity/email-confirmation.entity";

declare global {
  declare namespace Express {
    export interface Request {
      userId: string | null;
      email: string;
      deviceId: string | null;
    }
  }
} // расширение типов
