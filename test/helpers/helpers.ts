import {randomInt} from "crypto";
import {defaultLogName} from "./default-log-name";

export const logger = (object, loggerName: string = ' ---> ') => {
    const util = require('util')

    console.log(loggerName, util.inspect(object, {showHidden: false, depth: null, colors: true}))

}

export const magicLogger = () => {
    const max = defaultLogName.length
    const randomNumber = randomInt(0, max)

    console.log(defaultLogName[randomNumber])
}

export const sleep = (delay: number) => {
    const second = 1000;
    return new Promise((resolve) => setTimeout(resolve, delay * second));
}
