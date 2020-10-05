const Apify = require('apify');
const { log } = Apify.utils;

Apify.main(async () => {
    const datasetSubjects = await Apify.openDataset('default');

    let dd = await datasetSubjects.getData();

    if (dd.total == 0) {
        throw new Error('There are no dataset items to transform');
    }

    // console.dir(dd);

    let info = dd.items.map(e => `${e.macAddr};${e.vendor}\n`);

    log.info(info.join(''));

});