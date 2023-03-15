import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";

export class QuizGameRepository {
    constructor(@InjectDataSource() private dataSource: DataSource) {}

}