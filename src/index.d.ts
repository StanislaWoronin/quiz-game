import {TokenPayload} from "./common/dto/token-payload";

declare global {
  declare namespace Express {
    export interface Request {
      userId: string | null;
      tokenPayload: TokenPayload;
    }
  }
} // расширение типов
