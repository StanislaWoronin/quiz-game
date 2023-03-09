import {PartialType} from "@nestjs/mapped-types";
import {CreatedUser} from "./created-user";

export class ViewUser extends PartialType(CreatedUser) {}