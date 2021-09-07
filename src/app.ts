import express from 'express';
import cors from 'cors';
import bodyparser from 'body-parser';
import cards from './cards';

const app = express();
app.use(bodyparser.json());
app.use(cors());
app.use(express.static('public'));
const port = process.env.PORT || 4000;

app.get('/main', (req, res) => {
  const categories = cards;
  res.json(categories);
});

app.post('/login', (req, res) => {
  const user = req.body as {l: string, p: string};
  if (user.l === 'admin' && user.p === 'admin') res.status(200).end();
  else res.status(418).send('Wrong login or password!!!');
});

app.route('/categories/:id')
  .put((req, res) => {
    const { id } = req.params;
    let category: string;
    const promise = new Promise((resolve) => {
      category = req.body.category;
      if (req.body.category) resolve(req.body.category);
    });
    promise.then(() => {
      cards[0].splice(Number(id), 1, category);
      res.json(cards);
    });
  })
  .delete((req, res) => {
    const { id } = req.params;
    cards[0].splice(Number(id), 1);
    cards.splice((Number(id) + 1), 1);
    res.json(cards);
  })
  .post((req, res) => {
    cards[0].push(req.body.category);
    cards.push([]);
    res.json(cards);
  });

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
