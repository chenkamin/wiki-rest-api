const wiki = require('wikipedia');

(async () => {
    try {
        const page = await wiki.page('dog');
        // console.log(page);
        //Response of type @Page object
        const summary = await page.summary();
        console.log("text", summary.extract);
        //Response of type @wikiSummary - contains the intro and the main image
    } catch (error) {
        console.log(error);
        //=> Typeof wikiError
    }
})();