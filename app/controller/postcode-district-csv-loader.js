const fs = require("fs");
const { parse } = require("csv-parse");
const PostcodeDistrict = require('../model/postcodedistrict');

exports.loadCsv = (req, res) => {
    console.log("Reading csv file from "+ req.query.fileLocation);
    fs.createReadStream(req.query.fileLocation)
        // .pipe(parse({ delimiter: ",", from_line: 1, to_line: 5 }))
        // Line 1 is actual line 1 of the file. If line 1 contains header, the please start from line 2 here, or remove  header line from file
        .pipe(parse({ delimiter: ",", from_line: 1, }))
        .on("data", function(row) {
            req.body.area = req.query.area;
            req.body.prefix = row[0];
            req.body.coverage = row[1];
            req.body.city = row[2];
            persistPostcodeDistrict(req);
        })
        .on("end", function() {
            console.log("finished");
            res.status(200);
            res.send('Success')
        })
        .on("error", function(error) {
            console.log(error.message);
            res.status(500);
            res.send('Error when reading csv file ' + error)
        });
};

/**
 * Builds PostcodeDistrict object from Request
 * 
 * @param {Request} req 
 */
function buildPostcodeDistrictObject(req) {
    return new PostcodeDistrict(buildPostcodeDistrictJson(req));
}

function persistPostcodeDistrict(req) {
    const PostcodeDistrict = buildPostcodeDistrictObject(req);
    // Save PostcodeDistrict in the database
    console.log(PostcodeDistrict);
    PostcodeDistrict.save()
        .then((data) => {})
        .catch((err) => {
            console.log('Error when persisting postcode district');
        });
}

/**
 * Builds PostcodeDistrict Json from Request
 * 
 * @param {Request} req 
 */
function buildPostcodeDistrictJson(req) {
    return {
        active: true,
        prefix: req.body.prefix,
        area: req.body.area,
        coverage: req.body.coverage,
        city: req.body.city,
        popular: false,
        acrive: true,
        slug: req.body.slug || getSlug(req.body.prefix, req.body.coverage)
    };
}

/**
 * Returns the slug from the given prefix
 * e.g if prefix = M & S PostcodeDistricts then Slug = m-s-PostcodeDistricts
 * Replaces special characters and replace space with -
 * 
 * @param {String} prefix 
 */
function getSlug(prefix, area) {
    return prefix.trim().replace(/[\W_]+/g, "-") + "-" + area.trim().replace(/[\W_]+/g, "_")
}