import { ViewSecurity } from '../api/view/view-security';
import {SqlSecurity} from "./sql/entity/security";

export interface IQuerySecurityRepository {
  getAllActiveSessions(
    userId: string,
  ): Promise<ViewSecurity[] | null>;
  getDeviseById(deviceId: string): Promise<SqlSecurity | null>;
}

export const IQuerySecurityRepository = 'IQuerySecurityRepository';
