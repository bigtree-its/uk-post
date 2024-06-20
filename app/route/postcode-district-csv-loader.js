const controller = require("../controller/postcode-district-csv-loader");

module.exports = (app) => {
    const path = process.env.CONTEXT_PATH + '/postcode-district-csv-loader';
    app.get(path, controller.loadCsv);

}