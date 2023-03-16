export class ViewPlayer {
  id: string;
  login: string;

  constructor(userId: string, login: string) {
    this.id = userId;
    this.login = login;
  }
}
