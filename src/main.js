const Apify = require('apify');
const { utils: { log } } = Apify;
const helper = require('./helper');
const util = require('util');
const { map } = require('p-iteration');

Apify.main(async () => {
    //clear dataset
    let dataset = await Apify.openDataset();
    await dataset.drop();

    const { macAddresses } = await Apify.getInput();

    // Launch the web browser.
    const browser = await Apify.launchPuppeteer();

    // Create and navigate new page
    console.log('Open target page');
    const page = await browser.newPage();
    await page.goto('https://macvendors.com/');


    const macAddressSelector = '#macaddress';
    const vendorSelector = '#vendor';


    const pageFunctionP = (macAddresses) => {

        var sequence = Promise.resolve();

        macAddresses.forEach((macAddr, i) => {
            sequence = sequence.then(async () => {
                await page.waitForSelector(macAddressSelector, { timeout: 15000 });

                await page.evaluate((macAddressSelector, vendorSelector) => {
                    document.querySelector(macAddressSelector).value = '';
                    document.querySelector(vendorSelector).innerText = '';
                }, macAddressSelector, vendorSelector);

                await page.waitFor(helper.getRndInteger(500, 3000));

                // Fill form fields and select desired search options
                console.log('Fill in search form');

                await page.type(macAddressSelector, macAddr);

                await page.waitFor(helper.getRndInteger(1500, 3000));

                const vendor = await page.$eval(vendorSelector, el => el.textContent);

                // Store data in default dataset
                await Apify.pushData({ macAddr, vendor });
            }).then(() => { log.info(`acabada execució de ${i}`) });
        });

        return sequence;
    };

    await pageFunctionP(macAddresses);

    await browser.close();
});