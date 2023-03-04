const saController = `/sa`;
const testingController = `/testing`;

export const endpoints = {
  sa: {
    quiz: {
      questions: `${saController}/quiz/questions`
    }
  },
  testing: {
    allData: `${testingController}/all-data`,
  }
}