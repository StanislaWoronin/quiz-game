import {INestApplication} from "@nestjs/common";
import {QuestionsFactory} from "./helpers/factories/questions-factory";
import {Questions} from "./helpers/request/questions";
import {Testing} from "./helpers/request/testing";
import {Test, TestingModule} from "@nestjs/testing";
import {AppModule} from "../src/app.module";
import {createApp} from "../src/config/create-app";
import {Game} from "./helpers/request/game";

describe('/sa/quiz/questions (e2e)', () => {
    const second = 1000;
    jest.setTimeout(5 * second);

    let app: INestApplication;
    let server;
    let questionsFactories: QuestionsFactory;
    let questions: Questions;
    let game: Game;
    let testing: Testing;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        const rawApp = await moduleFixture.createNestApplication();
        app = createApp(rawApp);
        await app.init();
        server = await app.getHttpServer();

        questions = new Questions(server);
        questionsFactories = new QuestionsFactory(questions);
        game = new Game(server);
        testing = new Testing(server);
    });

    beforeEach(async  () => {
        await testing.clearDb();

        const questions = await questionsFactories.createQuestions(10)
        expect.setState({questions})
    })

    afterAll(async () => {
        await app.close();
    });

    describe('POST -> "pair-game-quiz/pair/connection".' +
        'Connect current user to existing random pending pair or create' +
        'new pair which will be waiting second player', () => {

        it('Shouldn`t join into the game, if user already has active game', async () => {

        })

        it('Shouldn`t join into the game, if user is Unauthorized', async () => {

        })

        it('User create new pair quiz-game', async () => {

        })

        it('User leaves the game before it starts', async () => {

        })

        it('User join into active game', async () => {

        })

        it('User leaves the active game and try reconnect', async () => {

        })
    })

    describe('POST -> "pair-game-quiz/pair/my-current/answers"' +
        'Send answer for next not answered questions in active pair', () => {
        it('The user can`t send a response if he is not in an active pair' +
            'or he has already answered on all questions', async () => {

        })

        it('Shouldn`t send answer, if he is unauthorized', async () => {

        })

        it('Should send answer', async () => {

        })
    })

    describe('GET -> "pair-game-quiz/pair/:gameId"', () => {
        it('Shouldn`t return game if spefical id not found', async () => {

        })

        it('Shouldn`t return game if user tries to get pair in which user' +
            'is not participant', async () => {

        })

        it('Shouldn`t return game, if he is unauthorized', async () => {

        })

        it('Shouldn`t return game, if id has invalid format', async () => {

        })
    })

    describe('GET -> "pair-game-quiz/pair/my-current"' +
        'Return current unfinished user game', () => {

        it('Shouldn`t return game if user don`t has active pair', async () => {

        })

        it('Shouldn`t return game, if he is unauthorized', async () => {

        })

        it('Returns current pair in which current user is taking part', async () => {

        })
    })
})