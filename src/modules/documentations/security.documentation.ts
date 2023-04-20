import { applyDecorators } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ViewSecurity } from '../public/security/api/view/view-security';

export function ApiGetAllActiveSessions() {
  return applyDecorators(
    ApiOperation({
      summary: '',
    }),
    ApiOkResponse({
      description: '',
      type: [ViewSecurity],
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
  );
}

export function ApiDeleteAllActiveSessions() {
  return applyDecorators(
    ApiOperation({
      summary: '',
    }),
    ApiNoContentResponse(),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiNotFoundResponse(),
  );
}

export function ApiDeleteDeviceById() {
  return applyDecorators(
    ApiOperation({
      summary: '',
    }),
    ApiNoContentResponse(),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiForbiddenResponse({
      description: 'If try to delete a device that does not belong to you',
    }),
    ApiNotFoundResponse(),
  );
}
