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

let masterIsPlayer = false;

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
async function countResult(issue: string): Promise<string[] | undefined> {
  console.dir('countResult')
  console.dir(counterReady)
  if (!counterReady) {
    counterReady = true;
    const arr = Object.values(results.get(issue));
    const master = masterIsPlayer ? 0 : 1;
    const resultArr = [];
    for (let i = 0; i < arrCards.length; i += 1) {
      resultArr.push(
        (
          arr.filter((item) => item === i).length /
          (arr.length - master)
        ).toFixed(2)
      );
    }
    statistic.set(issue, resultArr);
    return resultArr;
  }
  counterReady = false;
  return undefined;
}

webSocketServer.on('connection', (ws) => {
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
        sendDataToPlayers({ type: c.SET_SETTINGS, issues, settings });
        sendDataToPlayers({ type: c.SET_LOCATION, location: '/game' });
        break;
      case c.SET_ROUND_START:
        results.set(issue, {});
        sendDataToPlayers({ type: c.SET_ROUND_START, issue });
        break;
      case c.RESTART_ROUND:
        results.set(issue, {});
        sendDataToPlayers({ type: c.RESTART_TIMER, issue });
        sendDataToPlayers({ type: c.SET_ROUND_START });
        break;
      case c.RESTART_TIMER:
        console.dir('RESTART_TIMER');
        sendDataToPlayers({ type: c.RESTART_TIMER, issue });
        break;
      case c.SET_ROUND_RESULT:
        console.dir('SET_ROUND_RESULT');
        results.set(issue, { ...results.get(issue), [playerId]: card }); 
        if (Object.keys(results.get(issue)).length === 1){
          setTimeout(() => {
            countResult(issue).then((res) => {
              if (res) {
                sendDataToPlayers({
                  type: c.SET_ROUND_RESULT,
                  issue,
                  statistic: res,
                  score: results.get(issue),
                })
              }
            })
          }, 10000);}
          if (
          sockets.size === Object.keys(results.get(issue)).length &&
          !counterReady
        ) {
          countResult(issue).then((res) => {
            if (res) {
              sendDataToPlayers({
                type: c.SET_ROUND_RESULT,
                issue,
                statistic: res,
                score: results.get(issue),
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
