import * as http from 'http';
import WebSocket from 'ws';

import app from './express';

import players from './players';
import { IPlayer } from './interface';
import * as c from './consts';

const port = process.env.PORT || 4000;
const server = http.createServer(app);
const webSocketServer = new WebSocket.Server({ server });

const sockets = new Map();

function sendPlayers() {
  sockets.forEach((socket) => {
    socket.send(JSON.stringify({ type: c.SET_PLAYERS, players }));
  });
}

webSocketServer.on('connection', (ws) => {
  ws.on('message', (m: string): void => {
    const { type, player, id }: { type: string; player: IPlayer; id: number } =
      JSON.parse(m);
    switch (type) {
      case c.PUT_PLAYER:
        sockets.set(player.id, ws);
        players.push(player);
        sendPlayers();
        break;
      case c.DEL_PLAYER:
        if (sockets.get(players[0].id) === ws) {
          players.splice(players.findIndex((item) => item.id === id), 1);
          sockets.get(id).close(1010, 'scrum master deleted you from session');
          sendPlayers();
        }
        break;
      default: break;
    }
  });
});

server.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
