import Text from '../schemas/paragraph';

async function getRandomParagraph() {
  const randomNumber = Math.floor(Math.random() * 7191); //TODO: romove hard coded number
  const paragraph: any = await Text.findOne({
    where: { id: randomNumber },
  }).then((data) => {
    return data?.get(`${paragraph}`);
  });
  return { paragraph };
}

export default { getRandomParagraph };
