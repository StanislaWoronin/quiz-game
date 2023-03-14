import {NewQuestionDto} from "../../applications/dto/new-question.dto";

export class CreatedQuestions {
  readonly id: string
  readonly body: string
  readonly correctAnswers: string[]
  readonly published: boolean
  readonly createdAt: string
  readonly updatedAt: string

  constructor(id: string, createdQuestions: NewQuestionDto, answers: string[]) {
    this.id = id
    this.body = createdQuestions.body
    this.correctAnswers = answers
    this.published = false
    this.createdAt = createdQuestions.createdAt
    this.updatedAt = null
  }
}
