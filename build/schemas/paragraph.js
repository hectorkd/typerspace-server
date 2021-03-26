"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const index_1 = __importDefault(require("../models/index"));
class Paragraph extends sequelize_1.Model {
}
Paragraph.init({
    text: sequelize_1.DataTypes.STRING(1000),
    difficultyRating: sequelize_1.DataTypes.STRING,
    characterLength: sequelize_1.DataTypes.STRING,
}, { sequelize: index_1.default, modelName: 'paragraph' });
exports.default = Paragraph;
