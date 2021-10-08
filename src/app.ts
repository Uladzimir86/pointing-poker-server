import * as http from 'http';
import WebSocket from 'ws';

import app from './express';

import { IChatData, IPlayer } from './interface';
import * as c from './consts';

const port = process.env.PORT || 4000;
const server = http.createServer(app);
const webSocketServer = new WebSocket.Server({ server });

const sessions = new Set();
const rooms = new Map();
const players = new Map();
const sessionPlayers = new Map(); // all users

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
      sessions.delete(currentSession);
      rooms.delete(currentSession);
      players.delete(currentSession);
      sessionPlayers.delete(currentSession);
      currentStatistic.delete(currentSession);
      allStatistic.delete(currentSession);
      currentScore.delete(currentSession);
    });
}
function deletePlayer(
  id: number,
  mes: string,
  currentSession: string,
  ws: WebSocket | null = null
) {
  const findPlayerIndex = (arr: any): number => {
    if (arr) return arr.findIndex((item: any) => item?.id === id);
    return -1;
  };
  const sessionPlayerIndex = findPlayerIndex(sessionPlayers.get(currentSession));
  if (sessionPlayerIndex >= 0) {
    rooms.get(currentSession)[sessionPlayerIndex].close(1000, mes);
  }
  if (ws) {
    const findIndexWS = (): number =>
      rooms.get(currentSession).findIndex((item: any) => item === ws);
    const indexWS = findIndexWS();
    rooms.get(currentSession).splice(indexWS, 1);
    if (sessionPlayers.get(currentSession)) {
      const idPlayer = sessionPlayers.get(currentSession)[indexWS]?.id;
      if (
        players
          .get(currentSession)
          .findIndex((item: any) => item?.id === idPlayer) >= 0
      )
        players.get(currentSession).splice(
          players
            .get(currentSession)
            .findIndex((item: any) => item?.id === idPlayer),
          1
        );
      sessionPlayers.get(currentSession).splice(indexWS, 1);
    }
  }
  sendDataToPlayers(
    { type: c.SET_PLAYERS, players: players.get(currentSession) },
    currentSession
  );
}

async function countResult(
  currentSession: string,
  issue: string,
  arrCards: any
): Promise<number[] | undefined> {

  const arrIdVoteCards = [...currentStatistic.get(currentSession)];

  const resultArr = [];
  for (let i = 0; i < arrCards.length; i += 1) {
    resultArr.push(
      Number(
        (
          (100 * arrIdVoteCards.filter((item: number) => item === i).length) /
          arrIdVoteCards.length
        ).toFixed(1)
      )
    );
  }

  return resultArr;
}

const setResults = (
  currentSession: string,
  playerId: number,
  card: number,
  masterIsPlayer: boolean
) => {
  if (masterIsPlayer) {
    currentStatistic.get(currentSession).push(card);
    currentScore.get(currentSession)[playerId] = card;
  }
  if (!masterIsPlayer && players.get(currentSession)[0].id !== playerId) {
    currentStatistic.get(currentSession).push(card);
    currentScore.get(currentSession)[playerId] = card;
  }
};

webSocketServer.on('connection', (ws) => {
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
      msgChat,
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
      msgChat: IChatData[];
    } = JSON.parse(m);

    switch (type) {
      case c.SET_SESSION:
        sessions.add(idSession);
        rooms.set(idSession, [ws]);
        currentSession = idSession;
        players.set(currentSession, []);
        sessionPlayers.set(currentSession, []);
        break;

      case c.CHECK_ID_SESSION:
        if (sessions.has(idSession)) {
          rooms.get(idSession).push(ws);
          currentSession = idSession;
        } else ws.close(1000, ' Access denied... ');
        break;

      case c.PUT_PLAYER:
        players.get(currentSession).push(player);
        sessionPlayers.get(currentSession).push(player);
        sendDataToPlayers(
          { type: c.SET_PLAYERS, players: sessionPlayers.get(currentSession) },
          currentSession
        );
        break;

      case c.DEL_PLAYER:
        if (rooms.get(currentSession)[0] === ws) {
          deletePlayer(
            playerId,
            'scrum master deleted you from session',
            currentSession
          );
        }
        break;

      case c.PUT_OBSERVER:
        sessionPlayers.get(currentSession).push(player);
        sendDataToPlayers(
          { type: c.SET_PLAYERS, players: sessionPlayers.get(currentSession) },
          currentSession
        );
        break;

      case c.SET_LOCATION:
        ws.send(JSON.stringify({ type: c.SET_LOCATION, location }));
        break;

      case c.CLOSE_SESSION:
        if (playerId === players.get(currentSession)[0].id)
          closeSockets(currentSession);
        else deletePlayer(playerId, 'Session closed...', currentSession);
        break;

      case c.START_GAME:
        allStatistic.set(currentSession, []);
        sendDataToPlayers(
          { type: c.SET_PLAYERS, players: players.get(currentSession) },
          currentSession
        );
        sendDataToPlayers(
          { type: c.SET_SETTINGS, issues, settings },
          currentSession
        );
        sendDataToPlayers(
          { type: c.SET_LOCATION, location: '/game' },
          currentSession
        );
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
        sendDataToPlayers({ type: c.RESTART_TIMER, issue }, currentSession);
        sendDataToPlayers({ type: c.SET_ROUND_START }, currentSession);
        break;

      case c.STOP_GAME:
        sendDataToPlayers({ type: c.SET_LOCATION, location: '/results' },
        currentSession);
        break;

      case c.UPDATE_CHAT:
        sendDataToPlayers({ type: c.UPDATE_CHAT, msgChat },currentSession);
        break;

      case c.RESTART_TIMER:
        sendDataToPlayers({ type: c.RESTART_TIMER, issue }, currentSession);
        break;

      case c.SET_ROUND_RESULT:
        setResults(
          currentSession,
          playerId,
          card,
          settings.scramMasterAsPlayer
        );
        if (
          players.get(currentSession)?.length ===
          currentStatistic.get(currentSession)?.length +
            Number(!settings.scramMasterAsPlayer)
        ) {
          countResult(currentSession, issue, settings.cardStorage).then(
            (res) => {
              if (res) {
                allStatistic
                  .get(currentSession)
                  .push({ resultsVote: res, idIssue: issue });
                sendDataToPlayers(
                  {
                    type: c.SET_ROUND_RESULT,
                    issue,
                    statistic: allStatistic.get(currentSession),
                    score: currentScore.get(currentSession),
                  },
                  currentSession
                );
              }
            }
          );
        }
        break;
      default:
        break;
    }
  });
  ws.on('close', () => {
    if (rooms.get(currentSession) && ws === rooms.get(currentSession)[0])
      closeSockets(currentSession);
    if (rooms.get(currentSession) && ws !== rooms.get(currentSession)[0])
      deletePlayer(0, '', currentSession, ws);
  });
});

server.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
