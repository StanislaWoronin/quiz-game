import { preparedQuestions } from '../prepeared-data/prepared-questions';
import {CreatedQuestions} from "../../../src/modules/questions/api/view/created-questions";
import {ViewPage} from "../../../src/shared/pagination/view-page";
import {SortByField} from "../../../src/shared/pagination/query-parameters/sort-by-field";
import {SortDirection} from "../../../src/shared/pagination/query-parameters/sort-direction";
import {PageDto} from "../../../src/shared/pagination/page.dto";

export const expectCreatedQuestion = (): CreatedQuestions => {
  return {
    id: expect.any(String),
    body: preparedQuestions.valid.body,
    correctAnswers: preparedQuestions.valid.correctAnswers,
    published: preparedQuestions.published.default,
    createdAt: expect.any(String),
    updatedAt: expect.any(String),
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
  const skip = pageSize * page

  let items = sortingQuestions.slice(skip)
  if(skip + pageSize < pagesCount) {
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
