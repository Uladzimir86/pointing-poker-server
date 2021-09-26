"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var http = __importStar(require("http"));
var ws_1 = __importDefault(require("ws"));
var express_1 = __importDefault(require("./express"));
var c = __importStar(require("./consts"));
var players = [];
// let arrIssues: any;
var arrCards;
// let gameSettings: any;
var counterReady = false;
var port = process.env.PORT || 4000;
var server = http.createServer(express_1.default);
var webSocketServer = new ws_1.default.Server({ server: server });
var results = new Map();
var sockets = new Map();
var statistic = new Map();
var masterIsPlayer = false;
function sendDataToPlayers(data) {
    if (sockets.size)
        sockets.forEach(function (socket) {
            socket.send(JSON.stringify(data));
        });
}
function closeSockets() {
    if (sockets.size)
        sockets.forEach(function (socket) {
            socket.close(1000, 'Scrum master leaved this session...');
        });
}
function deletePlayer(id, mes) {
    var playerIndex = function () {
        return players.findIndex(function (item) { return (item === null || item === void 0 ? void 0 : item.id) === id; });
    };
    if (playerIndex() >= 0)
        players.splice(playerIndex(), 1);
    if (sockets.has(id))
        sockets.get(id).close(1000, mes);
    sendDataToPlayers({ type: c.SET_PLAYERS, players: players });
}
function countResult(issue) {
    return __awaiter(this, void 0, void 0, function () {
        var arrIdVoteCards, resultArr, _loop_1, i;
        return __generator(this, function (_a) {
            console.dir('countResult');
            console.dir(counterReady);
            if (!counterReady) {
                counterReady = true;
                arrIdVoteCards = Object.values(results.get(issue));
                resultArr = [];
                _loop_1 = function (i) {
                    resultArr.push(Number((100 * arrIdVoteCards.filter(function (item) { return item === i; }).length /
                        (arrIdVoteCards.length)).toFixed(1)));
                };
                for (i = 0; i < arrCards.length; i += 1) {
                    _loop_1(i);
                }
                statistic.set(issue, resultArr);
                return [2 /*return*/, resultArr];
            }
            counterReady = false;
            return [2 /*return*/, undefined];
        });
    });
}
webSocketServer.on('connection', function (ws) {
    ws.on('message', function (m) {
        var _a, _b;
        var _c, _d;
        var _e = JSON.parse(m), type = _e.type, player = _e.player, playerId = _e.playerId, location = _e.location, idSession = _e.idSession, issues = _e.issues, settings = _e.settings, issue = _e.issue, card = _e.card;
        var master = masterIsPlayer ? 0 : 1;
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
                if (!players.length ||
                    (players.length && idSession !== String((_c = players[0]) === null || _c === void 0 ? void 0 : _c.id)))
                    ws.close(1000, ' Access denied... ');
                break;
            case c.PUT_PLAYER:
                if (!players.length)
                    players[0] = player;
                else
                    players.push(player);
                sockets.set(player.id, ws);
                sendDataToPlayers({ type: c.SET_PLAYERS, players: players });
                break;
            case c.DEL_PLAYER:
                if (sockets.get((_d = players[0]) === null || _d === void 0 ? void 0 : _d.id) === ws)
                    deletePlayer(playerId, 'scrum master deleted you from session');
                break;
            case c.SET_LOCATION:
                ws.send(JSON.stringify({ type: c.SET_LOCATION, location: location }));
                break;
            case c.CLOSE_SESSION:
                if (playerId === players[0].id)
                    closeSockets();
                else
                    deletePlayer(playerId, 'Session closed...');
                break;
            case c.START_GAME:
                arrCards = settings.cardStorage;
                masterIsPlayer = settings.scramMasterAsPlayer;
                sendDataToPlayers({ type: c.SET_SETTINGS, issues: issues, settings: settings });
                sendDataToPlayers({ type: c.SET_LOCATION, location: '/game' });
                break;
            case c.SET_ROUND_START:
                results.set(issue, {});
                sendDataToPlayers({ type: c.SET_ROUND_START, issue: issue });
                break;
            case c.RESTART_ROUND:
                results.set(issue, {});
                sendDataToPlayers({ type: c.RESTART_TIMER, issue: issue });
                sendDataToPlayers({ type: c.SET_ROUND_START });
                break;
            case c.RESTART_TIMER:
                console.dir('RESTART_TIMER');
                sendDataToPlayers({ type: c.RESTART_TIMER, issue: issue });
                break;
            case c.SET_ROUND_RESULT:
                console.dir('SET_ROUND_RESULT');
                if (masterIsPlayer)
                    results.set(issue, __assign(__assign({}, results.get(issue)), (_a = {}, _a[playerId] = card, _a)));
                if (!masterIsPlayer && players[0].id !== playerId)
                    results.set(issue, __assign(__assign({}, results.get(issue)), (_b = {}, _b[playerId] = card, _b)));
                if (results.get(issue) && Object.keys(results.get(issue)).length === 1) {
                    setTimeout(function () {
                        countResult(issue).then(function (res) {
                            if (res) {
                                sendDataToPlayers({
                                    type: c.SET_ROUND_RESULT,
                                    issue: issue,
                                    statistic: res,
                                    score: results.get(issue),
                                });
                            }
                        });
                    }, 15000);
                }
                if (results.get(issue) &&
                    sockets.size === Object.keys(results.get(issue)).length + master) {
                    countResult(issue).then(function (res) {
                        console.dir('sendDataToPlayers');
                        if (res) {
                            sendDataToPlayers({
                                type: c.SET_ROUND_RESULT,
                                issue: issue,
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
server.listen(port, function () {
    console.log("Example app listening at http://localhost:" + port);
});
