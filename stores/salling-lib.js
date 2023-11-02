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

exports.getCanonical = function (item, today, store) {
    let quantity = item.units;
    let unit = item.unitsOfMeasure;
    let name = [((item.brand || "") + " " + (item.subBrand || "")).trim(), item.productName || item.name || item.productType, item.description]
        .filter((e) => e != "")
        .join(", ");
    const bio = name.includes("øko");

    const price = item.storeData[Object.keys(item.storeData)[0]].price / 100;

    return utils.convertUnit(
        {
            id: item.objectID,
            name,
            description: item.description ?? "",
            price: price,
            priceHistory: [{ date: today, price: price }],
            unit,
            quantity,
            url: `/produkt/"${encodeURIComponent([item.brand || "", item.name].join(" "))}/${item.objectID}`,
            bio,
        },
        units,
        store
    );
};

exports.fetchData = async function (path, appId, key) {
    const SEARCHSTRING = "";

    const headers = {
        "X-Algolia-Api-Key": key,
        "X-Algolia-Application-Id": appId,
    };

    data = {
        analytics: false,
        query: SEARCHSTRING,
        clickAnalytics: false,
        // Minimal amount of information needed, but "*" can be used to discover more
        attributesToRetrieve: ["*"], //["objectID", "productName", "description", "units", "unitsOfMeasure", "storeData", "brand"],
        // Max API wants to return appears to be 1000 items
        hitsPerPage: 1000,
        page: 0,
        analyticsTags: [],
    };

    const baseURL = "https://" + appId.toLowerCase() + "-dsn.algolia.net";

    const page1 = await axios({
        url: `${baseURL}/1/indexes/prod_${path}_PRODUCTS/query`,
        method: "post",
        headers,
        data,
    });

    const requestPromises = [];
    for (let pageIndex = 1; pageIndex <= page1.data.nbPages; pageIndex++) {
        requestPromises.push(
            axios({
                url: `${baseURL}/1/indexes/prod_${path}_PRODUCTS/query`,
                method: "post",
                headers,
                data: {
                    ...data,
                    page: pageIndex,
                },
            })
        );
    }

    const results = await Promise.all(requestPromises);

    const items = page1.data.hits;
    results.forEach((r, i) => {
        r.data.hits.forEach((p) => {
            items.push(p);
        });
    });

    return items;
};

exports.initializeCategoryMapping = async () => {};

exports.mapCategory = (rawItem) => {};

exports.urlBase = "https://www.føtex.dk";
