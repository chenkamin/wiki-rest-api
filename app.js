const express = require('express');
const crypto = require('crypto');
const wiki = require('wikipedia');
const app = express();
const acceptLanguage = require('accept-language');
var requestLanguage = require('express-request-language');
var cookieParser = require('cookie-parser');


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

const checkLang = (lang) => langs.includes(lang)

//routes
app.use('/sanity', (req, res) => {
    res.send("hello world")
})

app.get('/introduction/:articleName', async (req, res) => {
    const lang = (req.language.split("-")[0]);
    // console.log(langs.includes(req.language));
    // console.log(checkLang(req.language))
    const articleName = req.params.articleName
    if (/^[A-Za-z0-9_-]+$/.test(articleName) == false) {
        res.status(404).json({ message: "accepted sympls are _ and - only" })

    }
    console.log("letter numbres")
    try {
        const page = await wiki.page(articleName);
        const newUrl = await wiki.setLang(lang);
        // console.log(page);
        //Response of type @Page object
        const summary = await page.summary();

        console.log("text", summary.extract);
        //Response of type @wikiSummary - contains the intro and the main image
        res.status(200).json({
            scrapeDate: Math.round(+new Date() / 1000),
            articleName: articleName,
            introduction: summary.extract
        })
    } catch (error) {
        console.log(error);
        //=> Typeof wikiError
        res.status(404).json({ error })
    }
})



let users = [{}];
app.post("/user", (req, res) => {
    const body = req.body
    body.token = crypto
        .createHash('sha256')
        .digest('hex');
    users.push(body);
    res.status(201).json({ token: body.token })
})

app.all('*', (req, res, next) => {
    next(res.status(404).json({ message: "route not exists" }));
});

module.exports = app;







