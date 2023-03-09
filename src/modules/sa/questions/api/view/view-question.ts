import { PartialType } from "@nestjs/mapped-types";
import { CreatedQuestions } from "./created-questions";

export class ViewQuestion extends PartialType(CreatedQuestions) {}