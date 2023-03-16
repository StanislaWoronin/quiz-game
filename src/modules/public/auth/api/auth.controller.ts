import {Body, Controller, HttpCode, HttpStatus, Post} from "@nestjs/common";
import {RegistrationDto} from "./dto/registration.dto";

@Controller('auth')
export class AuthController {
    constructor(

    ) {
    }

    // @Throttle(5, 10)
    // @UseGuards(ThrottlerGuard)
    @Post('registration')
    @HttpCode(HttpStatus.NO_CONTENT)
    async registration(
        @Body() dto: RegistrationDto
    ) {
        await this.createUserUseCase.execute(dto);

        return;
    }
}
