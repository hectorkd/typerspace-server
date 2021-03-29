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
const index_1 = __importDefault(require("./index"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const socketHelperFunctions_1 = __importDefault(require("./socketHelperFunctions"));
const gameState = {};
console.log('befor the server is created');
const server = http_1.createServer(index_1.default);
console.log('inbetween server and io');
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT'],
    },
});
console.log('You made it here, woooooooo');
io.on('connection', (socket) => __awaiter(void 0, void 0, void 0, function* () {
    const { roomId } = socket.handshake.query;
    console.log('------------ New ws connection for room', roomId, ' from ', socket.id);
    socket.join(`${roomId}`);
    yield socketHelperFunctions_1.default
        .joinUser(`${roomId}`, socket.id, gameState)
        .then(() => {
        const usersArray = socketHelperFunctions_1.default.getPlayers(gameState, roomId);
        io.to(`${roomId}`).emit('playerInfo', usersArray);
    })
        .catch((err) => {
        console.error(err);
    });
    socket.on('userInfo', ({ userName, color }) => {
        const curUser = gameState[`${roomId}`].users[socket.id];
        const updatedUser = Object.assign(Object.assign({}, curUser), { userName: userName, color: color });
        gameState[`${roomId}`].users[socket.id] = updatedUser;
        const usersArray = socketHelperFunctions_1.default.getPlayers(gameState, roomId);
        io.to(`${roomId}`).emit('playerInfo', usersArray);
        io.to(`${socket.id}`).emit('getParagraph', gameState[`${roomId}`].paragraph); // emit paragraph once only to user
    });
    socket.on('syncStart', () => {
        io.to(`${roomId}`).emit('startRace');
        const timeNow = Date.now();
        const raceStartTime = timeNow + 5000;
        gameState[`${roomId}`].startTime = raceStartTime;
        io.to(`${roomId}`).emit('startTime', `${raceStartTime}`);
    });
    socket.on('position', ({ currIndex }) => {
        const currPositions = gameState[`${roomId}`].positions;
        const color = gameState[`${roomId}`].users[socket.id].color;
        const newPositions = Object.assign(Object.assign({}, currPositions), { [socket.id]: { currIndex, color } });
        gameState[`${roomId}`].positions = newPositions;
    });
    setInterval(() => {
        io.in(`${roomId}`).emit('positions', gameState[`${roomId}`].positions);
    }, 500);
    socket.on('finishRace', ({ endTime, startTime, allKeyPresses, length }) => __awaiter(void 0, void 0, void 0, function* () {
        console.log({ endTime, startTime, allKeyPresses, length });
        // console.log('player finished', endTime, correctChar, errorChar, charLength, allKeyPresses);
        const { finishTime, WPM, accuracy } = socketHelperFunctions_1.default.calculateResults(endTime, startTime, allKeyPresses, length);
        gameState[`${roomId}`].users[socket.id].gameData = {
            finishTime,
            WPM,
            accuracy,
        };
        const usersArray = socketHelperFunctions_1.default.getPlayers(gameState, roomId);
        io.to(`${roomId}`).emit('results', usersArray);
    }));
    socket.on('getParagraph', () => __awaiter(void 0, void 0, void 0, function* () {
        const newParagraph = yield socketHelperFunctions_1.default.getRandomParagraph();
        const newGameState = Object.assign(Object.assign({}, gameState[`${roomId}`]), { paragraph: newParagraph });
        gameState[`${roomId}`] = newGameState;
        io.to(`${roomId}`).emit('getParagraph', gameState[`${roomId}`].paragraph);
    }));
    socket.on('playAgain', () => {
        const usersInRoom = gameState[`${roomId}`].users;
        for (const user in usersInRoom) {
            const newUserInfo = Object.assign(Object.assign({}, usersInRoom[user]), { gameData: {
                    finishTime: '',
                    WPM: undefined,
                    accuracy: undefined,
                } });
            usersInRoom[user] = newUserInfo;
        }
        const usersArray = socketHelperFunctions_1.default.getPlayers(gameState, roomId);
        io.to(`${roomId}`).emit('playerInfo', usersArray);
        socket.to(`${roomId}`).emit('navigateToLobby');
    });
    socket.on('disconnect', () => {
        // if (gameState[`${roomId}`].users[socket.id].isHost) {
        //   io.to(`${roomId}`).emit('hostDisconnect');
        //   socket.leave(`${roomId}`);
        //   delete gameState[`${roomId}`];
        // } else {
        delete gameState[`${roomId}`].users[socket.id];
        socket.leave(`${roomId}`);
        io.to(`${roomId}`).emit('playerDisconnect');
        const usersArray = socketHelperFunctions_1.default.getPlayers(gameState, roomId);
        io.to(`${roomId}`).emit('playerInfo', usersArray);
        // }
    });
}));
exports.default = server;
