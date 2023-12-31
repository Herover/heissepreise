const axios = require("axios");
const utils = require("./utils");

const HITS = Math.floor(30000 + Math.random() * 2000);

const units = {
    "": { unit: "stk", factor: 1 },
    dosen: { unit: "stk", factor: 1 },
    flasche: { unit: "stk", factor: 1 },
    flaschen: { unit: "stk", factor: 1 },
    "pkg.": { unit: "stk", factor: 1 },
};

exports.getCanonical = function (item, today) {
    let quantity = 1;
    let unit = "";
    // let text = (item.price.basePrice?.text ?? "").trim().split("(")[0].replaceAll(",", ".").toLowerCase();
    let text = (item.price.basePrice?.text ?? "").trim();
    let keyfactText = (item.keyfacts?.supplementalDescription ?? "").trim().split("/")[0].replaceAll(",", ".").toLowerCase();

    const name = `${item.keyfacts?.supplementalDescription?.concat(" ") ?? ""}${item.fullTitle}`;

    if (["stk", "par", "pk"].find((s) => "/" + s == text || s == text)) {
        quantity = 1;
        unit = "stk";
    } else {
        // if (text.startsWith("bei") && text.search("je ") != -1) text = text.substr(text.search("je "));

        // for (let s of ["ab ", "je ", "ca. ", "z.b.: ", "z.b. "]) text = text.replace(s, "").trim();

        const simpleUnitRegex = /^(\d+\.?,?\d*) (\w+)\.?$/;
        const multipliedUnitRegex = /^(\d+\.?,?\d*) x (\d+\.?,?\d*) (\w+)\.?$/;
        const rangeUnitRegex = /^(\d+\.?,?\d*)-(\d+\.?,?\d*) (\w+)\.?$/;

        let matches = keyfactText.match(simpleUnitRegex);
        if (matches && matches.length == 3) {
            quantity = parseFloat(matches[1].replace(",", "."));
            unit = matches[2];
        }

        if (!matches) {
            matches = keyfactText.match(multipliedUnitRegex);
            if (matches && matches.length == 4) {
                quantity = parseFloat(matches[1].replace(",", ".")) * parseFloat(matches[2].replace(",", "."));
                unit = matches[3];
            }
        }

        if (!matches) {
            matches = keyfactText.match(rangeUnitRegex);
            if (matches && matches.length == 4) {
                quantity = (parseFloat(matches[1].replace(",", ".")) + parseFloat(matches[2].replace(",", "."))) / 2;
                unit = matches[3];
            }
        }

        if (!matches) {
            quantity = 1;
            unit = "stk";
        }

        if (unit == "dele") {
            quantity = 1;
            unit = "stk";
        }
    }

    return utils.convertUnit(
        {
            id: item.productId,
            name,
            description: item.keyfacts?.description ?? "",
            price: item.price.price,
            priceHistory: [{ date: today, price: item.price.price }],
            unit,
            quantity,
            url: item.canonicalUrl,
            bio: name.toLowerCase().includes("øko"),
        },
        units,
        "lidl"
    );
};

exports.fetchData = async function () {
    const LIDL_SEARCH = `https://www.lidl.dk/p/api/gridboxes/DK/da/?max=${HITS}`;
    return (await axios.get(LIDL_SEARCH)).data.filter((item) => !!item.price.price);
};

exports.initializeCategoryMapping = async () => {};

exports.mapCategory = (rawItem) => {};

exports.urlBase = "https://www.lidl.dk";
