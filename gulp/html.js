import gulp from "gulp";

import {makeBuildSubpath} from "./index";
import options from "./options";

const INDEX_HTML_PATH = "src/app/index.html";

gulp.task("copy.html.embedded", done => {
    gulp.src(INDEX_HTML_PATH)
    .pipe(gulp.dest(makeBuildSubpath("embedded")));

    done();
});

gulp.task("copy.html.fullscreen", done => {
    gulp.src(INDEX_HTML_PATH)
    .pipe(gulp.dest(makeBuildSubpath("fullscreen")));

    done();
});

gulp.task("copy.html", options.fullscreen
    ? gulp.parallel("copy.html.embedded", "copy.html.fullscreen")
    : gulp.task("copy.html.embedded")
);

gulp.task("watch.html", done => {
    gulp.watch(INDEX_HTML_PATH, gulp.task("copy.html"));

    done();
});
