import fs from "fs";

import gulp from "gulp";
import modernizr from "modernizr";

const makeModernizrBuild = options =>
    new Promise(resolve => {
        modernizr.build(options, build => {
            resolve(build);
        });
    });

const modernizrOpts = {
    "feature-detects": [
        "network/fetch",
        "touchevents"
    ]
};

gulp.task("modernizr", async function (done) {
    const modernizrBuildString = await makeModernizrBuild(modernizrOpts);

    fs.writeFileSync("build/modernizr.js", modernizrBuildString);
    done();
});
