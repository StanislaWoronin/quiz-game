const saController = `/sa`;
const testingController = `/testing`;

export const endpoints = {
  sa: {
    quiz: {
      questions: `${saController}/quiz/questions`,
    },
    users: `${saController}/users`
  },
  testing: {
    allData: `${testingController}/all-data`,
    allRowCount: `${testingController}/all-row-count`
  },
};
