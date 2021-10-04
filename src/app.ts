import * as http from 'http';
import WebSocket from 'ws';

import app from './express';

// import players from './players';
import { IPlayer } from './interface';
import * as c from './consts';

const port = process.env.PORT || 4000;
const server = http.createServer(app);
const webSocketServer = new WebSocket.Server({ server });

const results = new Map();
const sockets = new Map();
const statistic = new Map();

const sessions = new Set();
const rooms = new Map();
const players = new Map();

const currentStatistic = new Map();
const allStatistic = new Map();
const currentScore = new Map();


function sendDataToPlayers(data: any, currentSession: string) {

  if (rooms.has(currentSession) && rooms.get(currentSession).length)
  rooms.get(currentSession).forEach((socket: WebSocket) => {
      socket.send(JSON.stringify(data));
    });
}
function closeSockets(currentSession: string) {
  if (rooms.has(currentSession) && rooms.get(currentSession).length)
  rooms.get(currentSession).forEach((socket: WebSocket) => {
      socket.close(1000, 'Scrum master leaved this session...');
    });
}
function deletePlayer(id: number, mes: string, currentSession: string) {
  const findPlayerIndex = (): number =>
    players.get(currentSession).findIndex((item: any) => item?.id === id);

  const playerIndex = findPlayerIndex();  
  if (playerIndex >= 0) {
    rooms.get(currentSession)[playerIndex].close(1000, mes)
    rooms.get(currentSession).splice(playerIndex, 1);
    players.get(currentSession).splice(playerIndex, 1);
  }
  sendDataToPlayers({ type: c.SET_PLAYERS, players: players.get(currentSession)}, currentSession);
}

async function countResult(currentSession: string, issue: string, arrCards: any): Promise<number[] | undefined> {
  console.log('countResult')

    const arrIdVoteCards = [...currentStatistic.get(currentSession)];

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

const setResults = (currentSession: string, playerId: number, card: number, masterIsPlayer: boolean) => {
  if (masterIsPlayer) {
    currentStatistic.get(currentSession).push(card); 
    currentScore.get(currentSession)[playerId] = card;
  }
  if (!masterIsPlayer && players.get(currentSession)[0].id !== playerId) {
    currentStatistic.get(currentSession).push(card);
    currentScore.get(currentSession)[playerId] = card;
  }
  console.log('setResults-currentStatistic-', currentStatistic)
}

webSocketServer.on('connection', (ws) => {
  console.dir('connection')
  let currentSession: string;
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
 
          sessions.add(idSession);
          rooms.set(idSession, [ws]);
          currentSession = idSession;
          players.set(currentSession, [])
        break;
      case c.CHECK_ID_SESSION:
        console.log('idSession', idSession)
        console.log('sessions', sessions)
        if (sessions.has(idSession)) {
          rooms.get(idSession).push(ws);
          currentSession = idSession;
        }
          else ws.close(1000, ' Access denied... ');
        break;
      case c.PUT_PLAYER:
        players.get(currentSession).push(player);
        sendDataToPlayers({ type: c.SET_PLAYERS, players: players.get(currentSession) }, currentSession);
        break;
      case c.DEL_PLAYER:
        if (rooms.get(currentSession)[0] === ws)
          {console.log('deletePlayer')
            deletePlayer(playerId, 'scrum master deleted you from session', currentSession);}
        break;
      case c.SET_LOCATION:
        ws.send(JSON.stringify({ type: c.SET_LOCATION, location }));
        break;
      case c.CLOSE_SESSION:
        if (playerId === players.get(currentSession)[0].id) closeSockets(currentSession);
        else deletePlayer(playerId, 'Session closed...', currentSession);
        break;
      case c.START_GAME:

        allStatistic.set(currentSession, []);

        sendDataToPlayers({ type: c.SET_SETTINGS, issues, settings }, currentSession);
        sendDataToPlayers({ type: c.SET_LOCATION, location: '/game' }, currentSession);
        break;
      case c.SET_ROUND_START:
        currentStatistic.set(currentSession, []);
        currentScore.set(currentSession, {});

        sendDataToPlayers({ type: c.SET_ROUND_START, issue }, currentSession);
        break;
      case c.RESTART_ROUND:
        currentStatistic.set(currentSession, []);
        currentScore.set(currentSession, {});
        allStatistic.get(currentSession).pop();
        // results.set(issue, {});
        sendDataToPlayers({ type: c.RESTART_TIMER, issue }, currentSession);
        sendDataToPlayers({ type: c.SET_ROUND_START }, currentSession);
        break;
      case c.RESTART_TIMER:
        console.log('RESTART_TIMER');
        sendDataToPlayers({ type: c.RESTART_TIMER, issue }, currentSession);
        break;
      case c.SET_ROUND_RESULT:
        setResults(currentSession, playerId, card, settings.scramMasterAsPlayer)
        console.log('SET_ROUND_RESULT');
        console.log(results.get(issue));

        console.log('sockets.size',sockets.size);

        if (
          rooms.get(currentSession)?.length === currentStatistic.get(currentSession)?.length + Number(!settings.scramMasterAsPlayer) ) {
          countResult(currentSession, issue, settings.cardStorage).then((res) => {
            console.log('sendDataToPlayers');
            if (res) {
              allStatistic.get(currentSession).push({resultsVote: res, idIssue: issue});
              console.log('allStatistic',allStatistic)
              sendDataToPlayers({
                type: c.SET_ROUND_RESULT,
                issue,
                statistic: allStatistic.get(currentSession),
                score: currentScore.get(currentSession),
              }, currentSession);
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
