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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var cors_1 = __importDefault(require("cors"));
var body_parser_1 = __importDefault(require("body-parser"));
var players_1 = __importDefault(require("./players"));
// import issues from './issues';
var app = express_1.default();
app.use(body_parser_1.default.json());
app.use(cors_1.default());
// app.use(express.static('public'));
app
    .route('/player-cards')
    .get(function (req, res) {
    res.json(players_1.default);
})
    .post(function (req, res) {
    var playerCard = req.body;
    var id = players_1.default.length;
    players_1.default.push(__assign(__assign({}, playerCard), { id: id }));
    res.json(players_1.default);
})
    .delete(function (req, res) {
    var id = Number(req.query.id);
    players_1.default.splice(id, 1);
    res.json(players_1.default);
})
    .put(function (req, res) {
    var id = Number(req.query.id);
    var playerCard = req.body;
    players_1.default.splice(id, 1, playerCard);
    res.json(players_1.default);
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
exports.default = app;
