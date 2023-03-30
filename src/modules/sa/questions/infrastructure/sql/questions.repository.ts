import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreatedQuestions } from '../../api/view/created-questions';
import { SqlQuestions } from './entity/questions.entity';
import { toCreatedQuestions } from '../../../../../common/data-mapper/to-created-quesions';
import { UpdateQuestionDto } from '../../api/dto/update-question.dto';
import { IQuestionsRepository } from '../i-questions.repository';
import { CreateQuestionDto } from '../../api/dto/create-question.dto';

@Injectable()
export class QuestionsRepository implements IQuestionsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async createQuestion(
    dto: CreateQuestionDto,
  ): Promise<CreatedQuestions | null> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const manager = queryRunner.manager;

      const createdQuestions = await manager
        .getRepository(SqlQuestions)
        .save(new SqlQuestions(dto.body, dto.correctAnswers));

      await queryRunner.commitTransaction();
      return toCreatedQuestions(createdQuestions, dto.correctAnswers);
    } catch (e) {
      await queryRunner.rollbackTransaction();
      return null;
    } finally {
      await queryRunner.release();
    }
  }

  async updateQuestion(
    questionId: string,
    dto: UpdateQuestionDto,
  ): Promise<boolean> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const manager = queryRunner.manager;

      await this.dataSource
        .createQueryBuilder()
        .update(SqlQuestions)
        .set({
          body: dto.body,
          correctAnswers: dto.correctAnswers,
          updatedAt: new Date().toISOString(),
        })
        .where('id = :id', { id: questionId })
        .execute();

      return true;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      return false;
    } finally {
      await queryRunner.release();
    }
  }

  async updatePublishStatus(
    questionId: string,
    published: boolean,
  ): Promise<boolean> {
    const query = `
      UPDATE sql_questions
         SET published = '${published}', "updatedAt" = '${new Date().toISOString()}'
       WHERE id = '${questionId}'
    `;
    const result = await this.dataSource.query(query);

    if (result[1] !== 1) {
      return false;
    }
    return true;
  }

  async deleteQuestion(questionId: string): Promise<boolean> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const manager = queryRunner.manager;

      const result = await manager.delete(SqlQuestions, { id: questionId });
      if (result.affected === 0) {
        return false;
      }

      return true;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      return false;
    } finally {
      await queryRunner.release();
    }
  }
}
