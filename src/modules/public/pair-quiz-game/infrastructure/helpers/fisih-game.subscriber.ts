import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  UpdateEvent,
} from 'typeorm';
import { SqlGame } from '../sql/entity/sql-game.entity';

@EventSubscriber()
export class SqlGameSubscriber implements EntitySubscriberInterface<SqlGame> {
  constructor(dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return SqlGame;
  }

  // beforeInsert(event: InsertEvent<SqlGame>) {
  //   console.log(`BEFORE USER INSERTED: `, event.entity);
  // }

  afterUpdate(event: UpdateEvent<SqlGame>): Promise<any> | void {
    // console.log({ 1: event.entity });
    // const { status, startGameDate } = event.entity;
    return;
    // console.log({ 2: event.queryRunner });
    // console.log({ 3: event.manager });
    // console.log({ 4: event.databaseEntity });
  }
}
