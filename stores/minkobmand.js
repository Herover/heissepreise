const dagrofa = require("./dagrofa-lib");

exports.getCanonical = function (item, today) {
    return dagrofa.getCanonical(item, today, "Min Købmand");
};

exports.fetchData = async function () {
    return dagrofa.fetchData(1302, "https://longjohnapi.azurewebsites.net"); // Rødovre
};

exports.initializeCategoryMapping = async () => {};

exports.mapCategory = (rawItem) => {};

exports.urlBase = "https://raageleje.minkobmand.dk";
