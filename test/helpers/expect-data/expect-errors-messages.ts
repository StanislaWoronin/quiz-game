import { ErrorsMessages } from '../../../src/common/dto/errors-messages';

export const getErrorsMessage = (fields: string[]): ErrorsMessages[] => {
  const errorsMessages = [];

  for (let i = 0, length = fields.length; i < length; i++) {
    errorsMessages.push({
      message: expect.any(String),
      field: fields[i],
    });
  }

  return errorsMessages;
};
