import {getAvgScore} from "../../../../../common/helpers";
import {UserStatisticDb} from "../../infrastructure/sql/pojo/user-statistic.db";

export class ViewUserStatistic {
    sumScore: number
    avgScores: number
    gamesCount: number
    winsCount: number
    lossesCount: number
    drawsCount: number

    constructor(statistic: UserStatisticDb) {
        this.sumScore = Number(statistic.sumScore)
        this.avgScores = getAvgScore(statistic.sumScore, statistic.gamesCount)
        this.gamesCount = Number(statistic.gamesCount)
        this.winsCount = Number(statistic.winsCount)
        this.lossesCount = Number(statistic.lossesCount)
        this.drawsCount = Number(statistic.drawsCount)
    }
}