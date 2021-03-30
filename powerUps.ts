const scrambleWord = (text: string): string => {
  //scramble random word
  const words = text.split(' ');
  for (let i = 0; i < 5; i++) {
    const randomWordIndex = Math.floor(Math.random() * words.length);
    const scrambleWord = shuffle(words[randomWordIndex]);
    words[randomWordIndex] = scrambleWord;
  }
  return words.join(' ');
};

const shuffle = (word: string): string => {
  //Fisher–Yates shuffle
  const res = word.split('').slice();
  let range = res.length;
  while (range > 1) {
    const index = Math.floor(Math.random() * Math.floor(range));
    [res[range - 1], res[index]] = [res[index], res[range - 1]];
    range -= 1;
  }
  return res.join('');
};

const insertLongWord = (text: string): string => {
  //insert random long word at random place
  const longWords = [
    'nonrepresentational',
    'interdenominational',
    'interchangeableness',
    'individualistically',
    'incontrovertibility',
    'incomprehensibility',
    'electrocardiography',
    'counterintelligence',
    'conventionalisation',
    'uncharacteristically',
    'paleoanthropological',
    'noninstitutionalised',
    'magnetohydrodynamics',
    'internationalisation',
    'indistinguishability',
    'incontrovertibleness',
    'electroencephalogram',
    'counterrevolutionist',
    'incomprehensibilities',
    'asynchronous',
    'hippopotomonstrosesquippedaliophobia',
  ];
  const randomLongWord =
    longWords[Math.floor(Math.random() * longWords.length)];
  const words = text.split(' ');
  const randomIndex = Math.floor(Math.random() * words.length);
  words.splice(randomIndex, 0, randomLongWord);
  return words.join(' ');
};

const insertSymbols = (text: string): string => {
  //insert random symbols randomly
  const symbols = [
    '.',
    ',',
    '/',
    '?',
    '>',
    '<',
    ';',
    ':',
    '|',
    ']',
    '[',
    '}',
    '{',
    '!',
    '@',
    '#',
    '$',
    '%',
    '^',
    '&',
    '*',
    '(',
    ')',
    '-',
    '_',
    '=',
    '+',
  ];
  let newString = '';
  let oldString = text;
  const textLength = text.length;
  const start = 0;
  // while (textLength > 3) {
  //   const randomSymbolIndex = Math.floor(Math.random() * symbols.length);
  //   const end = Math.floor(Math.random() * textLength);
  //   newString += oldString.slice(start, end) + symbols[randomSymbolIndex];
  //   oldString = oldString.slice(end);
  //   textLength = oldString.length;
  // }
  // newString += oldString;
  for (let i = 0; i < 15; i++) {
    const randomSymbolIndex = Math.floor(Math.random() * symbols.length);
    const end = Math.floor(Math.random() * textLength);
    newString =
      oldString.slice(start, end) +
      symbols[randomSymbolIndex] +
      oldString.slice(end);
    oldString = newString;
  }
  return newString;
};

const powerUps = {
  scrambleWord,
  insertLongWord,
  insertSymbols,
};

export default powerUps;
