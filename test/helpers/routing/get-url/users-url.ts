import { endpoints } from '../routing';

export const getUrlForUpdateBanStatus = (id: string): string => {
  return `${endpoints.sa.users}/${id}/ban`;
};
