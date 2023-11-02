const salling = require("./salling-lib");

exports.getCanonical = function (item, today) {
    return salling.getCanonical(item, today, "netto");
};

exports.fetchData = async function () {
    return salling.fetchData(process.env.NETTO_PATH, process.env.NETTO_APP_ID, process.env.NETTO_KEY);
};

exports.initializeCategoryMapping = async () => {};

exports.mapCategory = (rawItem) => {};

exports.urlBase = "https://netto.dk";
