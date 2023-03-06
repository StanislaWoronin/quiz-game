export const getErrorMessage = (fields) => {
    const errorsMessages = [];
    for (let i = 0, length = fields.length; i < length; i++) {
        errorsMessages.push({
            message: expect.any(String),
            field: fields[i],
        });
    }

    return errorsMessages;
};