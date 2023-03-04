export class Factories {
  constructor(private readonly server: any) {
  }

  getErrorsMessage(fields: string[]) {
    const errorsMessages = [];

    for (let i = 0, length = fields.length; i < length; i++) {
      errorsMessages.push({
        message: expect.any(String),
        field: fields[i],
      });
    }

    return errorsMessages;
  }
}