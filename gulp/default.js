import gulp from "gulp";

gulp.task("default", gulp.series(
    "build",
    "serve",
    gulp.parallel(
        "watch.assets",
        "watch.data",
        "watch.html",
        "watch.src"
    )
));
