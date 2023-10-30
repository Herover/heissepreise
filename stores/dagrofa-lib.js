const axios = require("axios");
const utils = require("./utils");

const units = {
    bd: { unit: "stk", factor: 1 },
    ks: { unit: "stk", factor: 1 },
    pt: { unit: "stk", factor: 1 },
    stks: { unit: "stk", factor: 1 },
};

exports.fetchData = async function (merchantId, pageSize = 10000) {
    const base = "https://longjohnapifrontdoor-hndubyhwdyb6bzbj.z01.azurefd.net";
    const path = "/Product/query?";
    const paramenters = `merchantId=${merchantId}&pageNumber=0&pageSize=${pageSize}&displayedInStore=true`;

    const r = await axios({
        method: "get",
        url: base + path + paramenters,
        headers: {
            "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/118.0",
        },
    });

    return r.data.products;
};

exports.getCanonical = function (item, today, store) {
    let quantity = 1;
    let unit = "";
    const name = `${item.productDisplayName}, ${item.summary}`;
    const bio = item.productDisplayName.toLowerCase().includes("øko");

    const unitRegex = /^(\d+\.?,?\d*)\s*(\w+) \/ .*?$/;
    const unitPartsRegex = /^(\d+)\/(\d+)\s*(\w+) \/ .*?$/;
    const unitMultiplyRegex = /^(\d+\.?,?\d*)\s*x\s*(\d+\.?,?\d*)\s*(\w+) \/ .*?$/;
    const anyUnitMultiplyRegex = /(\d+\.?,?\d*)\s*x\s*(\d+\.?,?\d*)\s*(\w+)/;
    const anyUnitRegex = /(\d+\.?,?\d*)\s*(\w+)/;

    const summary = item.summary.toLowerCase().trim();
    const productDisplayName = item.productDisplayName.toLowerCase().trim();

    let matches = summary.match(unitRegex);
    if (matches && matches.length == 3) {
        quantity = parseFloat(matches[1].replace(",", "."));
        unit = matches[2].toLowerCase();
    }

    if (!matches) {
        matches = summary.match(unitPartsRegex);
        if (matches && matches.length == 4) {
            quantity = parseFloat(matches[1].replace(",", ".")) / parseFloat(matches[2].replace(",", "."));
            unit = matches[3].toLowerCase();
        }
    }

    if (!matches) {
        matches = summary.match(unitMultiplyRegex);
        if (matches && matches.length == 4) {
            quantity = parseFloat(matches[1].replace(",", ".")) * parseFloat(matches[2].replace(",", "."));
            unit = matches[3].toLowerCase();
        }
    }

    if (!matches) {
        matches = productDisplayName.match(anyUnitMultiplyRegex);
        if (matches && matches.length == 4) {
            quantity = parseFloat(matches[1].replace(",", ".")) * parseFloat(matches[2].replace(",", "."));
            unit = matches[3].toLowerCase();
        }
    }

    if (!matches) {
        matches = productDisplayName.match(anyUnitRegex);
        if (matches && matches.length == 3) {
            quantity = parseFloat(matches[1].replace(",", "."));
            unit = matches[2].toLowerCase();
        }

        // console.log(`m ${matches && matches.join && matches.join("-")} ${productDisplayName} ${summary}`)
    }

    if (unit == "mt") {
        unit = "stk";
        quantity = 1;
    }

    return utils.convertUnit(
        {
            id: item.sku,
            name,
            description: item.summary ?? "",
            price: item.discountPrice || item.price,
            priceHistory: [{ date: today, price: item.discountPrice || item.price }],
            unit,
            quantity,
            url: `/produkter/${item.productDisplayName.toLowerCase().replaceAll(" ", "-").replace("%", "%25")}-${item.sku}`,
            bio,
        },
        units,
        store
    );
};
