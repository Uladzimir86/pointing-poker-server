"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var cors_1 = __importDefault(require("cors"));
var body_parser_1 = __importDefault(require("body-parser"));
var cards_1 = __importDefault(require("./cards"));
var app = express_1.default();
app.use(body_parser_1.default.json());
app.use(cors_1.default());
app.use(express_1.default.static('public'));
var port = process.env.PORT || 4000;
app.get('/main', function (req, res) {
    var categories = cards_1.default;
    res.json(categories);
});
app.post('/login', function (req, res) {
    var user = req.body;
    if (user.l === 'admin' && user.p === 'admin')
        res.status(200).end();
    else
        res.status(418).send('Wrong login or password!!!');
});
app.route('/categories/:id')
    .put(function (req, res) {
    var id = req.params.id;
    var category;
    var promise = new Promise(function (resolve) {
        category = req.body.category;
        if (req.body.category)
            resolve(req.body.category);
    });
    promise.then(function () {
        cards_1.default[0].splice(Number(id), 1, category);
        res.json(cards_1.default);
    });
})
    .delete(function (req, res) {
    var id = req.params.id;
    cards_1.default[0].splice(Number(id), 1);
    cards_1.default.splice((Number(id) + 1), 1);
    res.json(cards_1.default);
})
    .post(function (req, res) {
    cards_1.default[0].push(req.body.category);
    cards_1.default.push([]);
    res.json(cards_1.default);
});
app.listen(port, function () {
    console.log("Example app listening at http://localhost:" + port);
});
