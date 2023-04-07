import {UserWithTokensType} from "./auth/user-with-token-type";

export type CreateFinishedGameType = Partial<{
    first: UserWithTokensType,
    second: UserWithTokensType,
    startFrom: number,
}>