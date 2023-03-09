import {endpoints} from "../routing";

export const getUrlForUpdatePublishStatus = (id: string): string => {
    return `${endpoints.sa.quiz.questions}/${id}/publish`;
};