import express from 'express';
import cors from 'cors';
import bodyparser from 'body-parser';

import playerCards from './players';
// import issues from './issues';
const app = express();

app.use(bodyparser.json());
app.use(cors());
// app.use(express.static('public'));

app
  .route('/player-cards')
  .get((req, res) => {
    res.json(playerCards);
    console.dir('playerCard')
  })
  .post((req, res) => {
    const playerCard = req.body;
    const id = playerCards.length;
    playerCards.push({...playerCard, id});
    // console.dir(playerCard)
    res.json(playerCards);
  })
  .delete((req, res) => {
    const id = Number(req.query.id);
    playerCards.splice(id, 1);
    res.json(playerCards);
  })
  .put((req, res) => {
    const id = Number(req.query.id);
    const playerCard = req.body;
    playerCards.splice(id, 1, playerCard);
    res.json(playerCards);
  });

// app
//   .route('/issues')
//   .get((req, res) => {
//     res.json(issues);
//     // console.dir('/issues')
//   })
//   .post((req, res) => {
//     const issue = req.body;
//     issues.push(issue);
//     res.json(issues);
//   })
//   .delete((req, res) => {
//     const id = Number(req.query.id);
//     issues.splice(id, 1);
//     res.json(issues);
//   })
//   .put((req, res) => {
//     const id = Number(req.query.id);
//     const issue = req.body;
//     issues.splice(id, 1, issue);
//     res.json(issues);
//   });

export default app;