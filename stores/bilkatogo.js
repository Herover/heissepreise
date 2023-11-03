const salling = require("./salling-lib");

exports.getCanonical = function (item, today) {
    return salling.getCanonical(item, today, "bilkatogo");
};

exports.fetchData = async function () {
    return salling.fetchData(process.env.BILKATOGO_PATH, process.env.BILKATOGO_APP_ID, process.env.BILKATOGO_KEY);
};

exports.initializeCategoryMapping = async () => {};

exports.mapCategory = (rawItem) => {};

exports.urlBase = "https://føtex.dk";
