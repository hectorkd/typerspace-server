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
const puppeteer_1 = __importDefault(require("puppeteer"));
const index_1 = __importDefault(require("./models/index"));
const paragraph_1 = __importDefault(require("./schemas/paragraph"));
const url = 'http://typeracerdata.com/texts?texts=full&sort=relative_average';
const scraper = (url) => __awaiter(void 0, void 0, void 0, function* () {
    const browser = yield puppeteer_1.default.launch();
    const page = yield browser.newPage();
    yield page.goto(url);
    yield page.waitForSelector('.stats');
    const tableText = yield page.$eval('tbody', (el) => el.innerText); //Todo set type of el
    const tableTextToArray = tableText.split('  ');
    const textToRows = tableTextToArray[0].split(`\n`);
    const rowsToColumns = textToRows.map((array) => array.split(`\t`));
    const result = rowsToColumns.map((index) => {
        index.splice(0, 2);
        index.splice(2, 1);
        index.splice(3);
        if (parseFloat(index[2]) < 0.6892)
            index[2] = '5';
        if (parseFloat(index[2]) < 0.8794)
            index[2] = '4';
        if (parseFloat(index[2]) < 1.0696)
            index[2] = '3';
        if (parseFloat(index[2]) < 1.2598)
            index[2] = '2';
        if (parseFloat(index[2]) < 1.4511)
            index[2] = '1';
        return index;
    });
    result.splice(0, 1);
    return result;
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield index_1.default.sync();
    const scrapeResult = yield scraper(url);
    scrapeResult.forEach((el) => {
        paragraph_1.default.create({
            text: el[0],
            difficultyRating: el[2],
            characterLength: el[1],
        });
    });
    console.log('Scraping has finished! Yippee!');
}))();
