const axios = require("axios");
const utils = require("./utils");

const units = {
    "": { unit: "stk", factor: 1 },
    bakke: { unit: "stk", factor: 1 },
    ltr: { unit: "ml", factor: 1000 },
    bdt: { unit: "stk", factor: 1 },
    pk: { unit: "stk", factor: 1 },
    rl: { unit: "stk", factor: 1 },
    breve: { unit: "stk", factor: 1 },
    kapsler: { unit: "stk", factor: 1 },
    slags: { unit: "stk", factor: 1 },
    stilke: { unit: "stk", factor: 1 },
};

exports.getCanonical = function (item, today) {
    let quantity = 1;
    let unit = "";
    const name = `${item.Name}, ${item.Description}`;
    const bio = item.Name.toLowerCase().endsWith("øko.");

    const simpleUnitRegex = /^(\d+\.?,?\d*) (\w+).*$/;
    const multipliedUnitRegex = /^(\d+\.?,?\d*) x (\d+\.?,?\d*) (\w+).*$/;
    const rangeUnitRegex = /^(\d+\.?,?\d*)-(\d+\.?,?\d*) (\w+).*$/;

    let matches = item.Description.match(multipliedUnitRegex);
    if (matches && matches.length == 4) {
        quantity = parseFloat(matches[1].replace(",", ".")) * parseFloat(matches[2].replace(",", "."));
        unit = matches[3];
    }

    if (!matches) {
        matches = item.Description.match(rangeUnitRegex);
        if (matches && matches.length == 4) {
            quantity = (parseFloat(matches[1].replace(",", ".")) + parseFloat(matches[2].replace(",", "."))) / 2;
            unit = matches[3];
        }
    }

    if (!matches) {
        matches = item.Description.match(simpleUnitRegex);
        if (matches && matches.length == 3) {
            quantity = parseFloat(matches[1].replace(",", "."));
            unit = matches[2];
        }
    }

    if (!matches) {
        quantity = 1;
        unit = "unknown";
    }

    return utils.convertUnit(
        {
            id: item.Id,
            name,
            description: item.Description ?? "",
            price: item.Price,
            priceHistory: [{ date: today, price: item.Price }],
            unit,
            quantity,
            url: "/" + item.Url,
            bio,
        },
        units,
        "nemlig"
    );
};

exports.fetchData = async function () {
    const baseURL = "https://www.nemlig.com";
    const dagligURL = baseURL + "/dagligvarer?sortorder=navn";
    // const basketURL = baseURL + "/webapi/basket/GetBasket";
    // const websiteURL = baseURL + "/webapi/v2/AppSettings/Website";

    const daglig = await axios.get(dagligURL);
    // const website = await axios.get(websiteURL);
    // const basket = await axios.get(basketURL);

    // Apparently we can just get the frontpage as JSON by asking for it to be JSON (which Axios
    // does by default)???
    // Ex `curl -H "Accept: application/json, text/plain, */*" https://www.nemlig.com/dagligvarer?sortorder=navn`
    // const productGroupIDs = Array.from(daglig.data.matchAll(/"ProductGroupId":"([\d\-A-z]+)"/g)).map(e => e[0]);
    const productGroupIDs = daglig.data.content
        .filter((e) => typeof e.ProductGroupId == "string")
        .map((e) => ({ id: e.ProductGroupId, n: e.TotalProducts }));
    const magicStamp = daglig.data.Settings.CombinedProductsAndSitecoreTimestamp;
    const timeslot = daglig.data.Settings.TimeslotUtc;
    const magic1 = "1";
    const magic2 = "0";

    const pageSize = 100;
    const order = "navn";

    const items = [];
    const requestPromises = [];
    productGroupIDs.forEach((g) => {
        for (let pageIndex = 0; pageIndex < Math.ceil(g.n / pageSize); pageIndex++) {
            requestPromises.push(
                axios({
                    url: `${baseURL}/webapi/${magicStamp}/${timeslot}/${magic1}/${magic2}/Products/GetByProductGroupId?sortorder=${order}&pageSize=${pageSize}&pageindex=${pageIndex}&productGroupId=${g.id}`,
                    method: "get",
                    headers: {
                        Referer: "https://www.nemlig.com/dagligvarer?sortorder=navn",
                    },
                })
            );
        }
    });

    const results = await Promise.all(requestPromises);

    results.forEach((r) => {
        r.data.Products.forEach((p) => {
            items.push(p);
        });
    });

    return items;
};

exports.initializeCategoryMapping = async () => {};

exports.mapCategory = (rawItem) => {};

exports.urlBase = "https://www.nemlig.com";
