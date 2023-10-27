const axios = require("axios");
const utils = require("./utils");

const units = {
    "": { unit: "stk", factor: 1 },
    bakke: { unit: "stk", factor: 1 },
    ltr: { unit: "l", factor: 1 },
    bdt: { unit: "stk", factor: 1 },
    pk: { unit: "stk", factor: 1 },
    rl: { unit: "stk", factor: 1 },
};

exports.getCanonical = function (item, today) {
    let quantity = 1;
    let unit = "";
    const name = `${item.item.name}, ${item.item.underline}`;

    const unitRegex = /^(\d+\.?\d*) (\w+)\..*?$/;

    let matches = item.item.underline.match(unitRegex);
    if (matches && matches.length == 3) {
        quantity = parseFloat(matches[1]);
        unit = matches[2].toLowerCase();
        if (unit == "mtr") {
            unit = "stk";
            quantity = 1;
        }
    }

    return utils.convertUnit(
        {
            id: item.item.id,
            name,
            description: item.item.description ?? "",
            price: item.item.pricing.price,
            priceHistory: [{ date: today, price: item.item.pricing.price }],
            unit,
            quantity,
            url: "/varer/" + item.item.id,
            bio: false, // Not available in api
        },
        units,
        "rema1000"
    );
};

exports.fetchData = async function () {
    const url = "https://cphapp.rema1000.dk/api/v1/catalog/store/1/withchildren";
    const r = await axios.get(url);
    const items = [];
    r.data.departments.forEach((department) => {
        department.categories.forEach((category) => {
            category.items.forEach((item) => {
                items.push({
                    item,
                    department: department.name,
                    category: category.name,
                });
            });
        });
    });
    return items;
};

exports.initializeCategoryMapping = async () => {};

exports.mapCategory = (rawItem) => {};

exports.urlBase = "https://shop.rema1000.dk";
