import { CreateQuestionsDto } from "./create-questions.dto";
import { PartialType } from "@nestjs/mapped-types";

export class UpdateQuestionDto extends PartialType(CreateQuestionsDto) {}