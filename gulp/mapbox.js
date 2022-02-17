import gulp from "gulp";

import {BUILD_CSS_PATH} from "./index";

const MAPBOX_CSS_PATH = "node_modules/mapbox-gl/dist/mapbox-gl.css";

gulp.task("copy.mapboxgl.css", done => {
    gulp.src(MAPBOX_CSS_PATH)
    .pipe(gulp.dest(BUILD_CSS_PATH));

    done();
});
