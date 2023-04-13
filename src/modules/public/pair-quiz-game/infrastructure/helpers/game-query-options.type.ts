import {GameQueryDto} from "../../api/dto/query/game-query.dto";

export type gameQueryOptions = Partial<{
    _gameIdFilter: boolean
    _gameStatusFilter: boolean
    dto: GameQueryDto
}>