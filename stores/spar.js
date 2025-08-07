const dagrofa = require("./dagrofa-lib");

exports.getCanonical = function (item, today) {
    return dagrofa.getCanonical(item, today, "Spar");
};

exports.fetchData = async function () {
    return dagrofa.fetchData(1222, "https://longjohnapi.azurewebsites.net"); // Glostrup
};

exports.initializeCategoryMapping = async () => {};

exports.mapCategory = (rawItem) => {};

exports.urlBase = "https://glostrup.spar.dk";
