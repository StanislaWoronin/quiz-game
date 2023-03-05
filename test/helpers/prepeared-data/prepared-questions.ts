import { faker } from '@faker-js/faker';

const randomArray = [
  faker.random.alpha(5),
  faker.random.alpha(5),
  faker.random.alpha(5),
];

export const preparedQuestions = {
  notValid: {
    long: {
      body: faker.random.alpha(501),
      correctAnswers: randomArray,
    },
    short: {
      body: faker.random.alpha(9),
      correctAnswers: randomArray,
    },
  },
  valid: {
    body: faker.random.alpha(10),
    correctAnswers: randomArray,
  },
  published: {
    default: false,
  },
};
