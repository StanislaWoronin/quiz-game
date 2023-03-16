import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { NewQuestionDto } from "../../applications/dto/new-question.dto";
import { CreatedQuestions } from "../../api/view/created-questions";
import { SqlQuestions } from "./entity/questions.entity";
import { SqlCorrectAnswers } from "./entity/answers.entity";
import { toCreatedQuestions } from "../../../../../common/data-mapper/to-created-quesions";
import { CreatedQuestionsDb } from "./pojo/created-questions.db";
import { UpdateQuestionDto } from "../../api/dto/update-question.dto";

@Injectable()
export class QuestionsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async createQuestion(
    newQuestion: NewQuestionDto,
    answers: string[]
  ): Promise<CreatedQuestions | null> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const manager = queryRunner.manager;
    try {
      const createdQuestions: CreatedQuestionsDb = await manager
        .getRepository(SqlQuestions)
        .save(newQuestion)

      let createdAnswer
      for (let i = 0, length = answers.length; i < length; i++) {
        createdAnswer = await manager
          .getRepository(SqlCorrectAnswers)
          .save({ questionId: createdQuestions.id, correctAnswer: answers[i] })
      }

      await queryRunner.commitTransaction();
      return toCreatedQuestions(createdQuestions, answers)
    } catch (e) {
      await queryRunner.rollbackTransaction();
      return null
    } finally {
      await queryRunner.release();
    }
  }

  async updateQuestion(
    questionId: string,
    dto: UpdateQuestionDto
  ): Promise<boolean> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const manager = queryRunner.manager;
    try {
      await this.dataSource.createQueryBuilder().update(SqlQuestions)
        .set({
          body: dto.body,
          updatedAt: new Date().toISOString()
        })
        .where("id = :id", { id: questionId })
        .execute()

      await manager.delete(SqlCorrectAnswers, {questionId})

      for (let i = 0, length = dto.correctAnswers.length; i < length; i++) {
        await manager
          .getRepository(SqlCorrectAnswers)
          .save({ questionId: questionId, correctAnswer: dto.correctAnswers[i] })
      }

      return true
    } catch (e) {
      await queryRunner.rollbackTransaction();
      return false
    } finally {
      await queryRunner.release();
    }
  }

  async updatePublishStatus(
    questionId: string,
    published: boolean
  ): Promise<boolean> {
    const query = `
      UPDATE sql_questions
         SET published = '${published}', "updatedAt" = '${new Date().toISOString()}'
       WHERE id = '${questionId}'
         AND EXISTS(SELECT "questionId"
                      FROM sql_answers
                     WHERE "questionId" = '${questionId}')
    `
    const result = await this.dataSource.query(query)

    if (result[1] !== 1) {
      return false;
    }
    return true;
  }

  async deleteQuestion(questionId: string): Promise<boolean> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const manager = queryRunner.manager;
    try {
      const result = await manager.delete(SqlQuestions, {id: questionId})
      if (result.affected === 0) {
        return false
      }

      await manager.delete(SqlCorrectAnswers, {questionId})

      return true
    } catch (e) {
      await queryRunner.rollbackTransaction();
      return false
    } finally {
      await queryRunner.release();
    }
  }
}
