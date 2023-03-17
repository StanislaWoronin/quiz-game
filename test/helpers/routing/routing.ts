const authController = `/auth`;
const saController = `/sa`;
const testingController = `/testing`;

export const endpoints = {
  auth: {
    login: `${authController}/login`,
    logout: `${authController}/logout`,
    me: `${authController}/me`,
    newPassword: `${authController}/new-password`,
    passwordRecovery: `${authController}/password-recovery`,
    registration: `${authController}/registration`,
    registrationConfirmation: `${authController}/registration-confirmation`,
    registrationEmailResending: `${authController}/registration-email-resending`,
    refreshToken: `${authController}/refresh-token`,
  },
  sa: {
    quiz: {
      questions: `${saController}/quiz/questions`,
    },
    users: `${saController}/users`,
  },
  testing: {
    allData: `${testingController}/all-data`,
    allRowCount: `${testingController}/all-row-count`,
    confirmationCode: `${testingController}/confirmation-code`,
    isConfirmed: `${testingController}/is-confirmed`,
    setExpirationDate: `${testingController}/set-expiration-date`
  },
};
