import gulp from "gulp";
import BrowserSync from "browser-sync";
import logger from "connect-logger";

import pkg from "../package.json";

const browserSync = BrowserSync.create();

// to inspect connections from Browserstack
const log = logger();

const getTime = () => new Date().getTime();

gulp.task("serve", done => {
	browserSync.init({
		server: {
			baseDir: "./build",
		},
		port: 3000,
		open: false,
		reloadOnRestart: true,
		notify: false,
		ghostMode: false,
		middleware: [
			log,
			// {
			//	 route: "/bundle.js",
			//	 handle: log
			// }, {
			//	 route: "/fullscreen/bundle.js",
			//	 handle: log
			// }
		],

		// watch & inject
		watch: true,
		files: [
			"build/fullscreen/bundle.css",
			"build/fullscreen/bundle.js",
			"build/fullscreen/index.html",
			"build/bundle.css",
			"build/bundle.js",
			"build/index.html",
		],
		ignore: [
			"build/fullscreen/bundle.css.map",
			"build/fullscreen/bundle.js.map",
			"build/bundle.css.map",
			"build/bundle.js.map",
		],

		logPrefix: `${pkg.name}`
	});

	done();
});
