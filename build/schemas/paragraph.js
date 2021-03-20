"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
class Text extends sequelize_1.Model {
}
Text.init({
    paragraph: sequelize_1.DataTypes.STRING,
    difficultyRating: sequelize_1.DataTypes.INTEGER,
    characterLength: sequelize_1.DataTypes.STRING,
});
