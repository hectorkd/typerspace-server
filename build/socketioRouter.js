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
    // await helperFunctions.joinUser(`${roomId}`, socket.id, gameState);
    // socket.join(`${roomId}`);
    // socket.on('userInfo', async ({ userName, color }) => {
    //   const curUser = gameState[`${roomId}`].users[socket.id];
    //   const updatedUser = {
    //     ...curUser,
    //     userName: userName,
    //     color: color,
    //   };
    //   gameState[`${roomId}`].users[socket.id] = updatedUser;
    //   const usersArray = [];
    //   for (const user in gameState[`${roomId}`].users) {
    //     usersArray.push(gameState[`${roomId}`].users[user]);
    //   }
    //   io.to(`${roomId}`).emit('playerInfo', usersArray);
    //   io.to(`${socket.id}`).emit(
    //     'getParagraph',
    //     gameState[`${roomId}`].paragraph,
    //   ); // emit paragraph once only to user
    // });
    // socket.on('syncStart', () => {
    //   io.to(`${roomId}`).emit('startRace');
    //   const timeNow = Date.now();
    //   const raceStartTime = timeNow + 5000;
    //   gameState[`${roomId}`].startTime = raceStartTime;
    //   io.to(`${roomId}`).emit('startTime', `${timeNow}`);
    // });
    // socket.on('position', ({ currIndex }) => {
    //   const currPositions = gameState[`${roomId}`].positions;
    //   const newPositions = {
    //     ...currPositions,
    //     [socket.id]: currIndex,
    //   };
    //   gameState[`${roomId}`].positions = newPositions;
    // });
    // setInterval(() => {
    //   io.in(`${roomId}`).emit('positions', gameState[`${roomId}`].positions);
    // }, 2000);
    // socket.on(
    //   'finishRace',
    //   async ({ endTime, startTime, allKeyPresses, length }) => {
    //     console.log({ endTime, startTime, allKeyPresses, length });
    //     // console.log('player finished', endTime, correctChar, errorChar, charLength, allKeyPresses);
    //     const { finishTime, WPM, accuracy } = helperFunctions.calculateResults(
    //       endTime,
    //       startTime,
    //       allKeyPresses,
    //       length,
    //     );
    //     gameState[`${roomId}`].users[socket.id].gameData = {
    //       finishTime,
    //       WPM,
    //       accuracy,
    //     };
    //     const usersArray = [];
    //     for (const user in gameState[`${roomId}`].users) {
    //       usersArray.push(gameState[`${roomId}`].users[user]);
    //     }
    //     io.to(`${roomId}`).emit('results', usersArray);
    //   },
    // );
}));
exports.default = server;
