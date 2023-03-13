import { preparedQuestions } from '../prepeared-data/prepared-questions';
import {CreatedQuestions} from "../../../src/modules/sa/questions/api/view/created-questions";
import {ViewPage} from "../../../src/common/pagination/view-page";
import {SortByField} from "../../../src/common/pagination/query-parameters/sort-by-field";
import {SortDirection} from "../../../src/common/pagination/query-parameters/sort-direction";
import {PageDto} from "../../../src/common/pagination/page.dto";
import {giveSkipNumber} from "../../../src/common/pagination/helpers";

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

export const expectResponseForGetAllQuestions = (
    sortBy: SortByField,
    sortDirection: SortDirection,
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    questions: CreatedQuestions[]
): ViewPage<CreatedQuestions> => {
  const sortingQuestions = getSortingItems(sortBy, sortDirection, questions)
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

export const getSortingItems = (
    sortBy: SortByField,
    sortDirection: SortDirection,
    questions: CreatedQuestions[]
) => {
  sortDirection === SortDirection.Ascending ?
      questions.sort((first, second) => first[sortBy] - second[sortBy]) :
      questions.sort((first, second) => second[sortBy] - first[sortBy])

  return questions
}
