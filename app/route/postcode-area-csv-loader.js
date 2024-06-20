const controller = require("../controller/postcode-area-csv-loader");

module.exports = (app) => {
    const path = process.env.CONTEXT_PATH + '/postcode-area-csv-loader';
    app.get(path, controller.loadCsv);

}