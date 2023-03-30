import { CreateQuestionDto } from '../../../src/modules/sa/questions/api/dto/create-question.dto';

export const preparedGameData: CreateQuestionDto[] = [
  {
    body: 'What is the capital of Australia?',
    correctAnswers: ['Canberra'],
  },
  {
    body: 'What is the name of the smallest ocean?',
    correctAnswers: ['Arctic Ocean'],
  },
  {
    body: 'What river flows through Paris?',
    correctAnswers: ['Seine river'],
  },
  {
    body: 'What is the only country bordering the United Kingdom?',
    correctAnswers: ['Ireland'],
  },
  {
    body: 'How many countries are inside the United Kingdom?',
    correctAnswers: ['4'],
  },
  {
    body: 'What is the largest island in the world?',
    correctAnswers: ['Greenland'],
  },
  {
    body: 'What natural disaster is measured on the Richter scale?',
    correctAnswers: ['Earthquakes'],
  },
  {
    body: 'Which planet is closest to the Sun?',
    correctAnswers: ['Mercury'],
  },
  {
    body: 'Who was the first person to see the moons of Jupiter?',
    correctAnswers: ['Galileo Galilei'],
  },
];
