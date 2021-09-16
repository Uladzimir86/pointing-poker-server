import * as http from 'http';
import WebSocket from 'ws';

import app from './express';

// import players from './players';
import { IPlayer } from './interface';
import * as c from './consts';

let players: IPlayer[] = [];
let arrIssues: any;
let gameSettings: any;
const port = process.env.PORT || 4000;
const server = http.createServer(app);
const webSocketServer = new WebSocket.Server({ server });

const sockets = new Map();

function sendDataToPlayers(data: any) {
  sockets.forEach((socket) => {
    socket.send(JSON.stringify(data));
  });
}
function closeSockets() {
  sockets.forEach((socket) => {
    socket.close(1000, 'Scrum master leaved this session...');
  });
}
function deletePlayer(id: number, mes: string) {
  const playerIndex = (): number => players.findIndex((item) => item?.id === id);
  if (playerIndex() >= 0) players.splice(playerIndex(), 1);
  if (sockets.has(id)) sockets.get(id).close(1000, mes);
  sendDataToPlayers({ type: c.SET_PLAYERS, players });
}

webSocketServer.on('connection', (ws) => {
  ws.on('message', (m: string): void => {
    const { type, player, id, location, idSession, issues, settings }: { type: string, player: IPlayer, id: number, location: string, idSession: string, issues: any, settings: any } =
      JSON.parse(m);
    switch (type) {
      case c.SET_SESSION:
        console.dir('SET_SESSION')
        if (sockets.size !== 0) {
          closeSockets();
          sockets.clear();
          players = [];
        }
        break;
      case c.CHECK_ID_SESSION:
        if(!players.length || (players.length && idSession !== String(players[0]?.id))) {console.dir(players.length); ws.close(1000, ' Access denied... ');}
        break;
      case c.PUT_PLAYER:
          if (!players.length) players[0] = player;
          else  players.push(player);
          sockets.set(player.id, ws);
          sendDataToPlayers({ type: c.SET_PLAYERS, players });
        break;
      case c.DEL_PLAYER:
        if (sockets.get(players[0]?.id) === ws) deletePlayer(id, 'scrum master deleted you from session');
        break;
      case c.SET_LOCATION:
        ws.send(JSON.stringify({ type: c.SET_LOCATION, location }));
        break;
      case c.CLOSE_SESSION:
        if( id === players[0].id) closeSockets()
        else deletePlayer(id, 'Session closed...');
        break;
      case c.START_GAME:
        arrIssues = issues;
        gameSettings = settings;
        sendDataToPlayers({ type: c.SET_LOCATION, location: '/game' });
        console.dir(arrIssues)
        console.dir(gameSettings)
        break;
      default: break;
    }
  });
});

server.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
