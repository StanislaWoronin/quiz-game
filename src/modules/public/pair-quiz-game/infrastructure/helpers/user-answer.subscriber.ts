import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  UpdateEvent,
} from 'typeorm';
import { SqlUserAnswer } from '../sql/entity/sql-user-answer.entity';

@EventSubscriber()
export class UserAnswerSubscriber
  implements EntitySubscriberInterface<SqlUserAnswer>
{
  constructor(dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return SqlUserAnswer;
  }

  // beforeInsert(event: InsertEvent<SqlGame>) {
  //   console.log(`BEFORE USER INSERTED: `, event.entity);
  // }

  afterUpdate(event: UpdateEvent<SqlUserAnswer>): Promise<any> | void {
    // console.log({ 1: event.entity });
    // const { status, startGameDate } = event.entity;
    return;
    // console.log({ 2: event.queryRunner });
    // console.log({ 3: event.manager });
    // console.log({ 4: event.databaseEntity });
  }
}
