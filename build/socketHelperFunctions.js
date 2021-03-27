"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const paragraph_1 = __importDefault(require("./schemas/paragraph"));
function getRandomParagraph() {
    return __awaiter(this, void 0, void 0, function* () {
        const randomNumber = Math.floor(Math.random() * 7191); //TODO: romove hard coded number
        const paragraph = yield paragraph_1.default.findOne({
            //TODO: fix any
            where: { id: randomNumber },
        }).then((data) => {
            return data === null || data === void 0 ? void 0 : data.get('text');
        });
        return paragraph;
    });
}
function joinUser(roomId, socketId, gameState) {
    return __awaiter(this, void 0, void 0, function* () {
        let isHost = false;
        if (!gameState[roomId]) {
            const paragraph = yield getRandomParagraph();
            gameState[roomId] = { users: {}, paragraph: paragraph };
            isHost = true;
        }
        gameState[roomId].users[socketId] = {
            userId: socketId,
            userName: 'Guest',
            color: '',
            isHost: isHost,
            isReady: false,
            gameData: {},
        };
        // const newGameState: Iuser = gameState[roomId].users[socketId]
    });
}
function calculateResults(endTime, startTime, allKeyPresses, charLength) {
    const { minutes, remainder, time } = calculateTime(endTime, startTime);
    const seconds = remainder < 10 ? `0${remainder}` : remainder;
    // console.log({ minutes, remainder, time });
    const wpm = calculateWpm(charLength, time);
    // console.log('wpm', wpm);
    const accuracy = calculateAccuracy(allKeyPresses, charLength);
    return { finishTime: `${minutes}:${seconds}`, WPM: wpm, accuracy };
}
function calculateTime(endTime, startTime) {
    const seconds = Math.round((endTime - parseInt(startTime)) / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainder = Math.round(seconds % 60);
    const percentageOfMinute = remainder / 60;
    return { minutes, remainder, time: minutes + percentageOfMinute };
}
function calculateWpm(charLength, time) {
    const wpm = Math.round(charLength / 5 / time);
    return wpm;
}
function calculateAccuracy(allKeyPresses, charLength) {
    const accuracy = Math.round((charLength / allKeyPresses) * 100);
    return accuracy;
}
function getPlayers(gameState, roomId) {
    const usersArray = [];
    for (const user in gameState[`${roomId}`].users) {
        usersArray.push(gameState[`${roomId}`].users[user]);
    }
    return usersArray;
}
exports.default = {
    getRandomParagraph,
    joinUser,
    calculateResults,
    getPlayers,
};
