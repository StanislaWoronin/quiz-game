import { isUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { BadRequestException } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';
import { ObjectId } from 'mongodb';

export class ParamsId {
  @Transform(({ value }) => {
    if (isUUID(value) || isValidObjectId(new ObjectId(value))) return value;
    throw new BadRequestException();
  })
  id: string;
}
