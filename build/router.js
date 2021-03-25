"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const paragraph_1 = __importDefault(require("./controllers/paragraph"));
const router = express_1.default.Router();
router.get('/get_paragraph', paragraph_1.default.getRandomParagraph);
router.get('/', (req, res) => {
    res.send('Hector the bad boi');
});
exports.default = router;
