import gulp from "gulp";

gulp.task("build", gulp.parallel(
    "copy.readme",
    "copy.assets",
    "copy.data",
    "copy.mapboxgl.css",
    "copy.html",
    "modernizr",
    "rollup"
));
