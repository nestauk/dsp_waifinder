import gulp from "gulp";

import {BUILD_PATH} from "./index";

const README_PATH = "README.md";

gulp.task("copy.readme", done => {
    gulp.src(README_PATH)
    .pipe(gulp.dest(BUILD_PATH));

    done();
});

gulp.task("watch.readme", done => {
    gulp.watch(README_PATH, gulp.series(
        "copy.readme",
    ));

    done();
});
