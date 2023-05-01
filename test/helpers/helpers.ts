import { randomInt, randomUUID } from 'crypto';
import { defaultLogName } from './default-log-name';
import { settings } from '../../src/settings';
import { ObjectId } from 'mongodb';

export const logger = (object, loggerName = ' ---> ') => {
  const util = require('util');

  console.log(
    loggerName,
    util.inspect(object, { showHidden: false, depth: null, colors: true }),
  );
};

export const magicLogger = () => {
  const max = defaultLogName.length;
  const randomNumber = randomInt(0, max);

  console.log(defaultLogName[randomNumber]);
};

export const sleep = (delay: number) => {
  const second = 1000;
  return new Promise((resolve) => setTimeout(resolve, delay * second));
};

export const getRandomId = () => {
  if (settings.currentRepository === settings.repositoryType.mongoose) {
    return new ObjectId().toString();
  }
  return randomUUID();
};

// export const setData = <T>(name: string, data: T) => {
//   expect.setState({ [name]: data as T });
// };
//
// export const getData = (name: string) => {
//   const data = expect.getState()[name];
// };
