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
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const sequelize = new sequelize_1.Sequelize('postgres://thseyuzazqdyyy:beabaadbed772f34190e9bf82ff6ff27b351484708979eeb90b30efb6ea43b34@ec2-107-22-245-82.compute-1.amazonaws.com:5432/ddq5r7di07mekt', {
    protocol: 'postgres',
    dialect: 'postgres',
    dialectOptions: { ssl: { rejectUnauthorized: false } },
});
// `${process.env.NAME}`,
// `${process.env.USERNAME}`,
// `${process.env.PASSWORD}`,
// {
//   host: `${process.env.HOST}`,
//   dialect: 'postgres',
// },
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield sequelize.sync();
    console.log('connected to db');
}))();
exports.default = sequelize;
