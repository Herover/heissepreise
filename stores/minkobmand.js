const dagrofa = require("./dagrofa-lib");

exports.getCanonical = function (item, today) {
    return dagrofa.getCanonical(item, today, "Min Købmand");
};

exports.fetchData = async function () {
    return dagrofa.fetchData(1263); // Rågeleje
};

exports.initializeCategoryMapping = async () => {};

exports.mapCategory = (rawItem) => {};

exports.urlBase = "https://raageleje.minkobmand.dk";
