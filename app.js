const crypto = require('crypto');
const express = require('express');
const app = express();
const wiki = require('wikipedia');
var requestLanguage = require('express-request-language');
var cookieParser = require('cookie-parser');

//hard-coded languages list.
const langs = ['zh-CN', 'en-US', 'fr-FR', 'he-IL'];
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(requestLanguage({
    languages: langs,
    cookie: {
        name: 'language',
        options: { maxAge: 24 * 3600 * 1000 },
        url: '/languages/{language}'
    }
}));



//routes
app.use('/sanity', (req, res) => {
    res.send("hello world")
})


const checkUserToken = (token) => users.find(u => u.token == token);

app.get('/introduction/:articleName', async (req, res) => {
    const token = (req.headers['x-authentication']);
    const user = checkUserToken(token);
    if (!user) {
        res.status(404).json({ message: "Token not valid" })
    };
    const articleName = req.params.articleName
    if (/^[A-Za-z0-9_-]+$/.test(articleName) == false) {
        res.status(404).json({ message: "accepted symbols are _ and - only" })
    }
    try {
        const page = await wiki.page(articleName);
        await wiki.setLang(user.language);
        const summary = await page.summary();
        res.status(200).json({
            scrapeDate: Math.round(+new Date() / 1000),
            articleName: articleName,
            introduction: summary.extract
        })
    } catch (error) {
        console.log(error);
        res.status(404).json({ message: `${error}` })
    }
})



let users = [{}];
app.post("/user", (req, res) => {
    const body = req.body
    body.token = crypto
        .createHash('sha256')
        .update(req.body.userName+Math.random())
        .digest('hex');
    users.push(body);
    res.status(201).json({ token: body.token })
})

app.all('*', (req, res, next) => {
    next(res.status(404).json({ message: "route not exists" }));
});

module.exports = app;







