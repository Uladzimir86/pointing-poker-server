import * as http from 'http';
import WebSocket from 'ws';

import app from './express';

// import players from './players';
import { IPlayer } from './interface';
import * as c from './consts';

let players: IPlayer[] = [];
// let arrIssues: any;
let arrCards: any[];
// let gameSettings: any;
let counterReady = false;
const port = process.env.PORT || 4000;
const server = http.createServer(app);
const webSocketServer = new WebSocket.Server({ server });

const results = new Map();
const sockets = new Map();
const statistic = new Map();

let current:number[] = [];

let masterIsPlayer = false;
let master:(0 | 1)=1;

function sendDataToPlayers(data: any) {

  if (sockets.size)
    sockets.forEach((socket) => {
      socket.send(JSON.stringify(data));
    });
}
function closeSockets() {
  if (sockets.size)
    sockets.forEach((socket) => {
      socket.close(1000, 'Scrum master leaved this session...');
    });
}
function deletePlayer(id: number, mes: string) {
  const playerIndex = (): number =>
    players.findIndex((item) => item?.id === id);
  if (playerIndex() >= 0) players.splice(playerIndex(), 1);
  if (sockets.has(id)) sockets.get(id).close(1000, mes);
  sendDataToPlayers({ type: c.SET_PLAYERS, players });
}

async function countResult(issue: string): Promise<number[] | undefined> {
  console.log('countResult')
  if (!counterReady) {
    counterReady = true;
    results.set(issue, current)
    const arrIdVoteCards = results.get(issue);
    // const arrIdVoteCards = Object.values(results.get(issue));
    console.log('countResult-',arrIdVoteCards)
    console.log(results.get(issue));
    const resultArr = [];
    for (let i = 0; i < arrCards.length; i += 1) {
      resultArr.push(
        Number((
          100 * arrIdVoteCards.filter((item: number) => item === i).length /
          (arrIdVoteCards.length)
        ).toFixed(1))
      );
    }
    statistic.set(issue, resultArr);
    return resultArr;
  }
  counterReady = false;
  return undefined;
}
const setResults = (issue: string, playerId: number, card: number) => {
  if (masterIsPlayer) current.push(card); 
  if (!masterIsPlayer && players[0].id !== playerId) current.push(card); 
  console.log('current-', current)
}

webSocketServer.on('connection', (ws) => {
  console.dir('connection')
  ws.on('message', (m: string): void => {

    const {
      type,
      player,
      playerId,
      location,
      idSession,
      issues,
      settings,
      issue,
      card,
    }: {
      type: string;
      player: IPlayer;
      playerId: number;
      location: string;
      idSession: string;
      issues: any;
      settings: any;
      issue: string;
      card: number;
    } = JSON.parse(m);

  

    switch (type) {
      case c.SET_SESSION:
        if (sockets.size !== 0) {
          closeSockets();
          sockets.clear();
          results.clear();
          statistic.clear();

          players = [];
          // arrIssues = [];
          arrCards = [];
        }
        break;
      case c.CHECK_ID_SESSION:
        if (
          !players.length ||
          (players.length && idSession !== String(players[0]?.id))
        )
          ws.close(1000, ' Access denied... ');
        break;
      case c.PUT_PLAYER:
        if (!players.length) players[0] = player;
        else players.push(player);
        sockets.set(player.id, ws);
        sendDataToPlayers({ type: c.SET_PLAYERS, players });
        break;
      case c.DEL_PLAYER:
        if (sockets.get(players[0]?.id) === ws)
          deletePlayer(playerId, 'scrum master deleted you from session');
        break;
      case c.SET_LOCATION:
        ws.send(JSON.stringify({ type: c.SET_LOCATION, location }));
        break;
      case c.CLOSE_SESSION:
        if (playerId === players[0].id) closeSockets();
        else deletePlayer(playerId, 'Session closed...');
        break;
      case c.START_GAME:
        arrCards = settings.cardStorage;
        masterIsPlayer = settings.scramMasterAsPlayer;
        master = masterIsPlayer ? 0 : 1;
        sendDataToPlayers({ type: c.SET_SETTINGS, issues, settings });
        sendDataToPlayers({ type: c.SET_LOCATION, location: '/game' });
        break;
      case c.SET_ROUND_START:
        current = [];
        results.set(issue, {});
        sendDataToPlayers({ type: c.SET_ROUND_START, issue });
        break;
      case c.RESTART_ROUND:
        current = [];
        results.set(issue, {});
        sendDataToPlayers({ type: c.RESTART_TIMER, issue });
        sendDataToPlayers({ type: c.SET_ROUND_START });
        break;
      case c.RESTART_TIMER:
        console.log('RESTART_TIMER');
        sendDataToPlayers({ type: c.RESTART_TIMER, issue });
        break;
      case c.SET_ROUND_RESULT:
        setResults(issue, playerId, card)
        console.log('SET_ROUND_RESULT');
        console.log(results.get(issue));
        console.log('master-',master);
        console.log('current-',current);
       
          // if (results.get(issue) && Object.keys(results.get(issue)).length === 1){
          // setTimeout(() => {
          //   console.log('setTimeout')
          //   countResult(issue).then((res) => {
          //     console.log('setTimeout-', res)
          //     if (res) {
          //       sendDataToPlayers({
          //         type: c.SET_ROUND_RESULT,
          //         issue,
          //         statistic: res,
          //         score: results.get(issue),
          //       })
          //     }
          //   })
          // }, 15000);}
          if (
          sockets.size === current.length + master ) {
          countResult(issue).then((res) => {
            console.log('sendDataToPlayers');
            if (res) {
              console.log('res',res)
              sendDataToPlayers({
                type: c.SET_ROUND_RESULT,
                issue,
                statistic: res,
                score: [{11111111: 1}],
              });
            }
          });
        }
        break;
      default:
        break;
    }
  });
});


server.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
