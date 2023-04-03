import { TestingRequestDto } from '../testing-request.dto';
import { ViewGame } from '../../../src/modules/public/pair-quiz-game/api/view/view-game';
import request from 'supertest';
import { endpoints } from '../routing/routing';
import { ViewAnswer } from '../../../src/modules/public/pair-quiz-game/api/view/view-answer';
import { getUrlWithId } from '../routing/get-url/url-with-id';
import {ViewPage} from "../../../src/common/pagination/view-page";
import {GameQueryDto} from "../../../src/modules/public/pair-quiz-game/api/dto/query/game-query.dto";
import {TestsPaginationType} from "../type/pagination.type";
import {SortByGameField} from "../../../src/modules/public/pair-quiz-game/api/dto/query/games-sort-field";
import {SortDirection} from "../../../src/common/pagination/query-parameters/sort-direction";
import {getUrlWithQuery} from "../routing/get-url/url-with-query";

export class Game {
  constructor(private readonly server: any) {}

  async joinGame(token?: string): Promise<TestingRequestDto<ViewGame>> {
    const response = await request(this.server)
      .post(endpoints.pairGameQuiz.pairs.connection)
      .auth(token, { type: 'bearer' });

    return { body: response.body, status: response.status };
  }

  async sendAnswer(
    answer: string,
    token?: string,
  ): Promise<TestingRequestDto<ViewAnswer>> {
    const response = await request(this.server)
      .post(endpoints.pairGameQuiz.pairs.myCurrent.answers)
      .auth(token, { type: 'bearer' })
      .send({ answer });

    return { body: response.body, status: response.status };
  }

  async getMyCurrentGame(token?: string): Promise<TestingRequestDto<ViewGame>> {
    const response = await request(this.server)
      .get(endpoints.pairGameQuiz.pairs.myCurrent.myCurrent)
      .auth(token, { type: 'bearer' });

    return { body: response.body, status: response.status };
  }

  async getGameById(
    gameId: string,
    token?: string,
  ): Promise<TestingRequestDto<ViewGame>> {
    const url = getUrlWithId(endpoints.pairGameQuiz.pairs.pairs, gameId);

    const response = await request(this.server)
      .get(url)
      .auth(token, { type: 'bearer' });

    return { body: response.body, status: response.status };
  }

  async getMyGames(
    {
      sortBy = SortByGameField.PairCreatedDate,
      sortDirection = SortDirection.Descending,
      pageNumber = 1,
      pageSize = 10,
    }: TestsPaginationType<SortByGameField>,
    token?: string
  ): Promise<TestingRequestDto<ViewGame>> {
    const query = {
      sortBy,
      sortDirection,
      pageSize,
      pageNumber
    }

    const url = getUrlWithQuery(endpoints.pairGameQuiz.pairs.my, query)

     const response = await request(this.server)
         .get(endpoints.pairGameQuiz.pairs.my)
         .auth(token, { type: 'bearer' });

     return { body: response.body, status: response.status }
  }
}
