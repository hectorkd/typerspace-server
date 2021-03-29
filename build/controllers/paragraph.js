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
const paragraph_1 = __importDefault(require("../schemas/paragraph"));
const sequelize_1 = require("sequelize");
const models_1 = __importDefault(require("../models"));
// const Op = Sequelize.Op;
function getRandomParagraph(_, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const paragraph = yield paragraph_1.default.findOne({
                order: models_1.default.random(),
                where: {
                    characterLengthNumeric: {
                        [sequelize_1.Op.lt]: 400,
                    },
                },
            });
            // console.log(`paragraph`, paragraph?.toJSON());
            res.status(200);
            res.send(`${paragraph === null || paragraph === void 0 ? void 0 : paragraph.characterLength}`);
        }
        catch (err) {
            console.error(err);
            res.status(500);
            res.send("Couldn't get a paragraph");
        }
    });
}
exports.default = {
    getRandomParagraph,
};
