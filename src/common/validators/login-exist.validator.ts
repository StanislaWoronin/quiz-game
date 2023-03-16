import {Inject, Injectable} from "@nestjs/common";
import {ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface} from "class-validator";
import {IUsersQueryRepository} from "../../modules/sa/users/infrastructure/i-users-query.repository";

@Injectable()
@ValidatorConstraint({ name: 'login', async: true })
export class LoginExistValidator implements ValidatorConstraintInterface {
    constructor(
        @Inject(IUsersQueryRepository)
        protected queryUsersRepository: IUsersQueryRepository,
    ) {}

    async validate(login) {
        const user =
            await this.queryUsersRepository.isLoginOrEmailExist(login);

        if (user) {
            return false;
        }

        return true;
    }

    defaultMessage(args: ValidationArguments) {
        return 'This login already exists';
    }
}