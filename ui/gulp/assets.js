import gulp from "gulp";

import {BUILD_CSS_PATH} from "./index";

/* ionicons */

const IONICONS_FONTS_GLOB = "node_modules/ionicons/dist/fonts/*";
const IONICONS_CSS_PATH = "node_modules/ionicons/dist/css/ionicons.min.css";

gulp.task("copy.ionicons.fonts", done => {
    gulp.src(IONICONS_FONTS_GLOB)
    .pipe(gulp.dest("build/fonts"));

    done();
});

gulp.task("copy.ionicons.css", done => {
    gulp.src(IONICONS_CSS_PATH)
    .pipe(gulp.dest(BUILD_CSS_PATH));

    done();
});

/* nesta */

const NESTA_FONTS_GLOB = "assets/nesta/fonts/*";
const NESTA_CSS_GLOB = "assets/nesta/css/*";;

gulp.task("copy.nesta.fonts", done => {
    gulp.src(NESTA_FONTS_GLOB)
    .pipe(gulp.dest("build/fonts"));

    done();
});

gulp.task("copy.nesta.css", done => {
    gulp.src(NESTA_CSS_GLOB)
    .pipe(gulp.dest(BUILD_CSS_PATH));

    done();
});

/* images */

const IMAGES_GLOB = "assets/images/*";

gulp.task("copy.images", done => {
    gulp.src(IMAGES_GLOB)
    .pipe(gulp.dest("build/images"));

    done();
});

gulp.task("copy.assets", gulp.series(
    "copy.ionicons.fonts",
    "copy.ionicons.css",
    "copy.nesta.fonts",
    "copy.nesta.css",
    "copy.images",
));

gulp.task("watch.assets", done => {
    gulp.watch(IMAGES_GLOB, gulp.series("copy.images"));

    done();
});
