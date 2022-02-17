import gulp from "gulp";

const COMPANIES_GLOB = "data/*";

gulp.task("copy.data", done => {
    gulp.src(COMPANIES_GLOB)
    .pipe(gulp.dest("build/data"));

    done();
});

gulp.task("watch.data", done => {
    gulp.watch(COMPANIES_GLOB, gulp.series("copy.data"));

    done();
});
