const dagrofa = require("./dagrofa-lib");

exports.getCanonical = function (item, today) {
    return dagrofa.getCanonical(item, today, "Meny");
};

exports.fetchData = async function () {
    return dagrofa.fetchData(558155); // Rønne
};

exports.initializeCategoryMapping = async () => {};

exports.mapCategory = (rawItem) => {};

exports.urlBase = "https://roenne.meny.dk/";
