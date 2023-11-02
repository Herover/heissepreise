const salling = require("./salling-lib");

exports.getCanonical = function (item, today) {
    return salling.getCanonical(item, today, "fotex");
};

exports.fetchData = async function () {
    return salling.fetchData(process.env.FOTEX_PATH, process.env.FOTEX_APP_ID, process.env.FOTEX_KEY);
};

exports.initializeCategoryMapping = async () => {};

exports.mapCategory = (rawItem) => {};

exports.urlBase = "https://føtex.dk";
