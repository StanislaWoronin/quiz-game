import {applyDecorators} from "@nestjs/common";
import {
    ApiBadRequestResponse,
    ApiBody,
    ApiCreatedResponse, ApiForbiddenResponse,
    ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse,
    ApiOperation, ApiQuery,
    ApiUnauthorizedResponse
} from "@nestjs/swagger";
import {CreateQuestionDto} from "../sa/questions/api/dto/create-question.dto";
import {CreatedQuestions} from "../sa/questions/api/view/created-questions";
import {QuestionsQueryDto} from "../sa/questions/api/dto/query/questions-query.dto";
import {ViewPage} from "../../common/pagination/view-page";
import {UpdateQuestionDto} from "../sa/questions/api/dto/update-question.dto";
import {BadRequestResponse} from "../../common/dto/errors-messages";
import {UpdatePublishStatusDto} from "../sa/questions/api/dto/update-publish-status.dto";
import {CreateUserDto} from "../sa/users/api/dto/create-user.dto";
import {CreatedUser} from "../sa/users/api/view/created-user";
import {UsersQueryDto} from "../sa/users/api/dto/query/users-query.dto";
import {ViewUser} from "../sa/users/api/view/view-user";
import {UpdateUserBanStatusDto} from "../sa/users/api/dto/update-user-ban-status.dto";

export function ApiCreateQuestion() {
    return applyDecorators(
        ApiOperation({
            summary: '',
        }),
        ApiBody({type: CreateQuestionDto}),
        ApiCreatedResponse({
            description: '',
            type: CreatedQuestions
        }),
        ApiUnauthorizedResponse({description: 'Unauthorized'})
    )
}

export function ApiGetAllQuestions() {
    return applyDecorators(
        ApiOperation({
            summary: '',
        }),
        ApiQuery({type: QuestionsQueryDto}),
        ApiOkResponse({
            description: '',
            type: ViewPage<CreatedQuestions>
        }),
        ApiUnauthorizedResponse({description: 'Unauthorized'})
    )
}

export function ApiUpdateQuestion() {
    return applyDecorators(
        ApiOperation({
            summary: '',
        }),
        ApiBody({type: UpdateQuestionDto}),
        ApiNoContentResponse(),
        ApiBadRequestResponse({type: BadRequestResponse}),
        ApiUnauthorizedResponse({description: 'Unauthorized'}),
        ApiNotFoundResponse()
    )
}

export function ApiUpdatePublishStatus() {
    return applyDecorators(
        ApiOperation({
            summary: '',
        }),
        ApiBody({type: UpdatePublishStatusDto}),
        ApiNoContentResponse(),
        ApiBadRequestResponse({type: BadRequestResponse}),
        ApiUnauthorizedResponse({description: 'Unauthorized'}),
        ApiNotFoundResponse()
    )
}

export function ApiDeleteQuestion() {
    return applyDecorators(
        ApiOperation({
            summary: '',
        }),
        ApiNoContentResponse(),
        ApiUnauthorizedResponse({description: 'Unauthorized'}),
        ApiNotFoundResponse()
    )
}

export function ApiCreateUser() {
    return applyDecorators(
        ApiOperation({
            summary: '',
        }),
        ApiBody({ type: CreateUserDto }),
        ApiCreatedResponse({type: CreatedUser}),
        ApiBadRequestResponse({type: BadRequestResponse}),
        ApiUnauthorizedResponse({description: 'Unauthorized'}),
    )
}

export function ApiGetUsers() {
    return applyDecorators(
        ApiOperation({
            summary: '',
        }),
        ApiQuery({ type: UsersQueryDto }),
        ApiOkResponse({type: ViewPage<ViewUser>}),
        ApiUnauthorizedResponse({description: 'Unauthorized'}),
    )
}

export function ApiUpdateUserBanStatus() {
    return applyDecorators(
        ApiOperation({
            summary: '',
        }),
        ApiBody({type: UpdateUserBanStatusDto}),
        ApiNoContentResponse(),
        ApiBadRequestResponse({type: BadRequestResponse}),
        ApiUnauthorizedResponse({description: 'Unauthorized'}),
    )
}

export function ApiDeleteUser() {
    return applyDecorators(
        ApiOperation({
            summary: '',
        }),
        ApiNoContentResponse(),
        ApiUnauthorizedResponse({description: 'Unauthorized'}),
        ApiNotFoundResponse()
    )
}

