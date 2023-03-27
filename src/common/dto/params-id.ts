import {IsNotEmpty, IsNotIn, IsString, IsUUID, Validate} from "class-validator";

export class ParamsId {
  @IsString()
  @Validate(
      function isNotInteger(str) {
        if (isNaN(str)) {
          return true;
        } else {
          return false;
        }
      }
  )
  id: string;
}
