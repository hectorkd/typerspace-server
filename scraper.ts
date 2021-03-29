import puppeteer from 'puppeteer';
import sequelize from './models/index';
import Paragraph from './schemas/paragraph';

const url = 'http://typeracerdata.com/texts?texts=full&sort=relative_average';

const scraper = async (url: string) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  await page.waitForSelector('.stats');
  const tableText = await page.$eval('tbody', (el: any) => el.innerText); //Todo set type of el
  const tableTextToArray = tableText.split('  ');
  const textToRows = tableTextToArray[0].split(`\n`);
  const rowsToColumns = textToRows.map((array: string) => array.split(`\t`));
  const result = rowsToColumns.map((index: Array<string>) => {
    index.splice(0, 2);
    index.splice(2, 1);
    index.splice(3);
    if (parseFloat(index[2]) < 0.6892) index[2] = '5';
    if (parseFloat(index[2]) < 0.8794) index[2] = '4';
    if (parseFloat(index[2]) < 1.0696) index[2] = '3';
    if (parseFloat(index[2]) < 1.2598) index[2] = '2';
    if (parseFloat(index[2]) < 1.4511) index[2] = '1';
    return index;
  });
  result.splice(0, 1);
  return result;
};

(async () => {
  await sequelize.sync();

  const scrapeResult = await scraper(url);

  scrapeResult.forEach((el: Array<string>) => {
    const characterLengthNumeric = parseInt(el[1]);
    Paragraph.create({
      text: el[0],
      difficultyRating: el[2],
      characterLength: el[1],
      characterLengthNumeric: !isNaN(characterLengthNumeric)
        ? characterLengthNumeric
        : null,
    });
  });
  console.log('Scraping has finished! Yippee!');
})();
