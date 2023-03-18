import { CreatedQuestions } from "../../src/modules/sa/questions/api/view/created-questions";

export class TestingRequestDto<T> {
  body: T
  status: number
}