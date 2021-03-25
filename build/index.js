"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const router_1 = __importDefault(require("./router"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
const app = express_1.default();
app.use((req, res, next) => {
    console.log(req.url);
    console.log(req.method);
    next();
});
app.use(cors_1.default({ origin: '*' }));
app.use(router_1.default);
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`running at http://localhost:${PORT} 🚀🚀🚀`));
exports.default = app;
