const fs = require("fs");
const { parse } = require("csv-parse");
const PostcodeArea = require("../model/postcodearea");
const Util = require("../util/utils");

exports.loadCsv = (req, res) => {
    console.log("Reading csv file");
    fs.createReadStream(req.query.fileLocation)
        // .pipe(parse({ delimiter: ",", from_line: 1, to_line: 5 }))
        .pipe(parse({ delimiter: ",", from_line: 1 }))
        .on("data", function(row) {
            // var prefix = row[0];
            // var cell = row[1];
            // if (cell.includes("(")) {
            //     var start = cell.indexOf("(");
            //     var end = cell.indexOf(")");
            //     council = cell.substring(0, start).trim();
            //     coverage = cell.substring(start + 1, end);
            // } else {
            //     coverage = cell;
            // }
            // req.body.area = req.query.area;
            // req.body.prefix = prefix;
            // req.body.coverage = coverage;
            // req.body.council = council;
            // req.body.postTown = req.query.postTown;
            // persistPostcodeArea(req);
            const newStr = row[0].replace(/\[|\]/g, "");
            var sanitized = newStr.split(",");
            var prefixArea = sanitized[0].split("-");
            var prefix = prefixArea[0];
            var area = prefixArea[1];
            var country = sanitized[1];
            req.body.prefix = prefix;
            req.body.area = area;
            req.body.country = country;
            persistPostcodeArea(req);
        })
        .on("end", function() {
            console.log("finished");
            res.status(200);
            res.send("Success");
        })
        .on("error", function(error) {
            console.log(error.message);
            res.status(500);
            res.send("Error when reading csv file " + error);
        });
};

/**
 * Builds PostcodeArea object from Request
 *
 * @param {Request} req
 */
function buildPostcodeAreaObject(req) {
    return new PostcodeArea(buildPostcodeAreaJson(req));
}

function persistPostcodeArea(req) {
    const PostcodeArea = buildPostcodeAreaObject(req);
    // Save PostcodeArea in the database
    PostcodeArea.save()
        .then((data) => {})
        .catch((err) => {
            console.log("Error when persisting postcode district");
        });
}

/**
 * Builds PostcodeArea Json from Request
 *
 * @param {Request} req
 */
function buildPostcodeAreaJson(req) {
    return {
        active: true,
        prefix: req.body.prefix,
        area: req.body.area,
        country: req.body.country,
        slug: req.body.slug || getSlug(req.body.prefix, req.body.area),
    };
}

/**
 * Returns the slug from the given prefix
 * e.g if prefix = M & S PostcodeAreas then Slug = m-s-PostcodeAreas
 * Replaces special characters and replace space with -
 *
 * @param {String} prefix
 */
function getSlug(prefix, area) {
    return (
        prefix
        .trim()
        .replace(/[\W_]+/g, "-") +
        "-" +
        area
        .trim()
        .replace(/[\W_]+/g, "_")
    );
}