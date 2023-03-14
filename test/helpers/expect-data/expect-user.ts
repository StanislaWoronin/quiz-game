import {preparedUser} from "../prepeared-data/prepared-user";
import {CreatedUser} from "../../../src/modules/sa/users/api/view/created-user";

export const expectCreatedUser = (): CreatedUser => {
    return {
        id: expect.any(String),
        login: preparedUser.valid.login,
        email: preparedUser.valid.email,
        createdAt: expect.any(String),
        banInfo: {
            isBanned: false,
            banDate: null,
            banReason: null
        }
    }
};
