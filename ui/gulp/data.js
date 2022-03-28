import gulp from "gulp";

const DS_DATA_GLOB = "../ds/outputs/data/ai_map_data.tsv";

gulp.task("copy.data", done => {
	gulp.src(DS_DATA_GLOB)
	.pipe(gulp.dest("build/data"));

	done();
});

gulp.task("watch.data", done => {
	gulp.watch(DS_DATA_GLOB, gulp.series("copy.data"));

	done();
});
