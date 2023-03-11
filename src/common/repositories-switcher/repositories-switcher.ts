import { repositories } from './repositories';

export const repositorySwitcher = (
  repositoryType: string,
  repositoryName: string,
) => {
  return repositories[repositoryType][repositoryName];
};
