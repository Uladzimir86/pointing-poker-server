import express from 'express';
import cors from 'cors';
import bodyparser from 'body-parser';

const app = express();

app.use(bodyparser.json());
app.use(cors());
// app.use(express.static('public'));


export default app;