import { PairQuizGameService } from './PairQuizGameService';
import { IQuizGameRepository } from './IQuizGameRepository';
import { IQuizGameQueryRepository } from './IQuizGameQueryRepository';
import { IQuestionsQueryRepository } from './IQuestionsQueryRepository';
import {AnswerDto} from "../api/dto/answer.dto";

describe('PairQuizGameService', () => {
    let gameRepository: IQuizGameRepository;
    let queryGameRepository: IQuizGameQueryRepository;
    let questionsQueryRepository: IQuestionsQueryRepository;
    let pairQuizGameService: PairQuizGameService;

    beforeEach(() => {
        gameRepository = {
            createGame: jest.fn(),
            joinGame: jest.fn(),
            sendAnswer: jest.fn(),
        };
        queryGameRepository = {
            checkUserCurrentGame: jest.fn(),
            checkOpenGame: jest.fn(),
            checkUserAnswerProgress: jest.fn(),
            getCorrectAnswers: jest.fn(),
        };
        questionsQueryRepository = {
            getQuestions: jest.fn(),
        };
        pairQuizGameService = new PairQuizGameService(
            gameRepository,
            queryGameRepository,
            questionsQueryRepository,
        );
    });

    describe('joinGame', () => {
        it('should return null if user is already playing a game', async () => {
            // Arrange
            const userId = '1';
            jest.spyOn(queryGameRepository, 'checkUserCurrentGame').mockResolvedValue(true);

            // Act
            const result = await pairQuizGameService.joinGame(userId);

            // Assert
            expect(result).toBeNull();
            expect(queryGameRepository.checkUserCurrentGame).toHaveBeenCalledWith(userId);
        });

        it('should create a new game if there are no open games', async () => {
            // Arrange
            const userId = '1';
            jest.spyOn(queryGameRepository, 'checkUserCurrentGame').mockResolvedValue(false);
            jest.spyOn(queryGameRepository, 'checkOpenGame').mockResolvedValue(false);
            const createdGame = {id: '2', players: [userId], status: 'waiting'};
            jest.spyOn(gameRepository, 'createGame').mockResolvedValue(createdGame);

            // Act
            const result = await pairQuizGameService.joinGame(userId);

            // Assert
            expect(result).toEqual(createdGame);
            expect(queryGameRepository.checkUserCurrentGame).toHaveBeenCalledWith(userId);
            expect(queryGameRepository.checkOpenGame).toHaveBeenCalled();
            expect(gameRepository.createGame).toHaveBeenCalledWith(userId);
        });

        it('should join an existing game if there is one', async () => {
            // Arrange
            const userId = '1';
            jest.spyOn(queryGameRepository, 'checkUserCurrentGame').mockResolvedValue(false);
            const existingGame = {id: '2', players: ['3'], status: 'waiting'};
            jest.spyOn(queryGameRepository, 'checkOpenGame').mockResolvedValue(existingGame);
            const joinedGame = {...existingGame, players: [existingGame.players[0], userId]};
            jest.spyOn(gameRepository, 'joinGame').mockResolvedValue(joinedGame);

            // Act
            const result = await pairQuizGameService.joinGame(userId);

            // Assert
            expect(result).toEqual(joinedGame);
            expect(queryGameRepository.checkUserCurrentGame).toHaveBeenCalledWith(userId);
            expect(queryGameRepository.checkOpenGame).toHaveBeenCalled();
            expect(gameRepository.joinGame).toHaveBeenCalledWith(userId, existingGame);
        });
    });

    describe('sendAnswer', () => {
        const userId = '123';
        const answer = 'A';
        const dto: AnswerDto = {answer};

        it('should return null if user has answered 5 questions', async () => {
            // Mock checkUserAnswerProgress to return an array of 5 elements
            mockQueryGameRepository.checkUserAnswerProgress.mockResolvedValue(new Array(5));

            const result = await service.sendAnswer(userId, dto);

            expect(result).toBeNull();
            expect(mockQueryGameRepository.checkUserAnswerProgress).toHaveBeenCalledWith(userId);
            expect(mockQueryGameRepository.getCorrectAnswers).not.toHaveBeenCalled();
            expect(mockGameRepository.sendAnswer).not.toHaveBeenCalled();
        });

        it('should send answer and return ViewAnswer if user has not answered 5 questions', async () => {
            const progressLength = 3;
            const gameId = 'gameId';
            const questionId = 'questionId';
            const correctAnswers = ['A', 'B', 'C', 'D', 'E'];
            const isCorrectAnswer = true;
            const isLastQuestion = false;
            const sendAnswerResult: ViewAnswer = {
                userId,
                answer,
                gameId,
                questionId,
                isCorrectAnswer,
                isLastQuestion,
            };

            // Mock checkUserAnswerProgress to return an array of 3 elements
            mockQueryGameRepository.checkUserAnswerProgress.mockResolvedValue(new Array(progressLength));

            // Mock getCorrectAnswers to return correct answers for the next question
            mockQueryGameRepository.getCorrectAnswers.mockResolvedValue({
                gameId,
                questionId,
                correctAnswers,
            });

            // Mock sendAnswer to return ViewAnswer
            mockGameRepository.sendAnswer.mockResolvedValue(sendAnswerResult);

            const result = await service.sendAnswer(userId, dto);

            expect(result).toEqual(sendAnswerResult);
            expect(mockQueryGameRepository.checkUserAnswerProgress).toHaveBeenCalledWith(userId);
            expect(mockQueryGameRepository.getCorrectAnswers).toHaveBeenCalledWith(userId, progressLength);
            expect(mockGameRepository.sendAnswer).toHaveBeenCalledWith(
                expect.objectContaining({
                    userId,
                    answer,
                    gameId,
                    questionId,
                    isCorrectAnswer,
                    isLastQuestion,
                }),
            );
        })
    })
})