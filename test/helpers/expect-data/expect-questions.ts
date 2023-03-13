import { preparedQuestions } from '../prepeared-data/prepared-questions';
import {CreatedQuestions} from "../../../src/modules/sa/questions/api/view/created-questions";
import {ViewPage} from "../../../src/common/pagination/view-page";
import {SortByField} from "../../../src/common/pagination/query-parameters/sort-by-field";
import {SortDirection} from "../../../src/common/pagination/query-parameters/sort-direction";
import {PageDto} from "../../../src/common/pagination/page.dto";
import {giveSkipNumber} from "../../../src/common/pagination/helpers";
import {ViewQuestion} from "../../../src/modules/sa/questions/api/view/view-question";
import {getSortingItems} from "./sorting-expect-items";

export const expectCreatedQuestion = (): CreatedQuestions => {
  return {
    id: expect.any(String),
    body: preparedQuestions.valid.body,
    correctAnswers: preparedQuestions.valid.correctAnswers,
    published: preparedQuestions.published.default,
    createdAt: expect.any(String),
    updatedAt: null,
  }
};

export const expectResponseForGetQuestions = (
    sortBy: SortByField,
    sortDirection: SortDirection,
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    questions: ViewQuestion[]
): ViewPage<ViewQuestion> => {
  const sortingQuestions = getSortingItems<ViewQuestion>(sortBy, sortDirection, questions)
  const skip = giveSkipNumber(page, pageSize)

  let items = sortingQuestions.slice(skip)
  if(skip + pageSize < totalCount) {
    items = sortingQuestions.slice(0, skip + pageSize)
  }

  return {
    pagesCount,
    page,
    pageSize,
    totalCount,
    items
  }
}

