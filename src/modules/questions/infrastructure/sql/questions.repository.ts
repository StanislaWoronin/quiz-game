import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { NewQuestionDto } from "../../applications/dto/new-question.dto";
import { CreatedQuestions } from "../../api/view/created-questions";
import { Questions } from "./entity/questions.entity";
import { Answers } from "./entity/answers.entity";
import { toCreatedQuestions } from "../../../../shared/data-mapper/to-created-quesions";
import { CreatedQuestionsDb } from "./pojo/created-questions.db";

@Injectable()
export class QuestionsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async createQuestion(newQuestion: NewQuestionDto, answers: string[]): Promise<CreatedQuestions | null> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const manager = queryRunner.manager;
    try {
      const createdQuestions: CreatedQuestionsDb = await manager
        .getRepository(Questions)
        .save(newQuestion)

      for (const answer in answers) {
        const createdAnswer = await manager
          .getRepository(Answers)
          .save({ questionId: createdQuestions.id, correctAnswer: answer })
      }

      await queryRunner.commitTransaction();
      return toCreatedQuestions(createdQuestions, answers)
    } catch (e) {
      await queryRunner.rollbackTransaction();
      console.log(e);
      return null
    } finally {
      await queryRunner.release();
    }
  }
}
