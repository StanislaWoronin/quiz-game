const authController = `/auth`;
const pairGameQuiz = '/pair-game-quiz'
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
  pairGameQuiz: {
    pairs: {
      sendAnswers: `${pairGameQuiz}/pair/answers`,
      connection: `${pairGameQuiz}/pair/connection`,
      myCurrent: `${pairGameQuiz}/pair/my-current`,
      pairs: `${pairGameQuiz}/pair`,
    }
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
    setExpirationDate: `${testingController}/set-expiration-date`,
    userPassword: `${testingController}/user-password`
  },
};
