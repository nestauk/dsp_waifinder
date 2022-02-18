import path from "path";

import gulp from "gulp";
import {rollup} from 'rollup';
import alias from "rollup-plugin-alias";
import svelte from "rollup-plugin-svelte";
import replace from "rollup-plugin-replace";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import buble from "rollup-plugin-buble";
import {terser} from "rollup-plugin-terser";

import pkg from "../package.json";

import {makeResolveAliases} from "../src/utils/buildUtils";

import {makeBuildSubpath} from "./index";
import options from "./options";

const resolveAliases = makeResolveAliases(path.resolve(__dirname, "../"));

const makeBuildConfig = (appConfig, isProductionBuild) => {
    const {withNestaFooter} = appConfig;

    const buildPath = withNestaFooter
        ? makeBuildSubpath("fullscreen")
        : makeBuildSubpath("embedded");

    return {
        bundleOpts: {
            input: "src/app/main.js",
            plugins: [
                replace({
                    include: [
                        "src/app/main.js",
                        "src/app/components/App.html",
                    ],
                    values: {
                        WITH_NESTA_FOOTER: withNestaFooter,
                        APP_OVERFLOW_Y: withNestaFooter ? "auto" : "hidden"
                        // APP_OVERFLOW_Y: withNestaFooter ? "scroll" : "hidden"
                    }
                }),
                alias(resolveAliases({
                    "@utils": "src/utils",
                    "@vendor": "src/vendor"
                })),
                svelte({
                    // opt in to v3 behaviour today
                    skipIntroByDefault: true,
                    nestedTransitions: true,
                    dev: !isProductionBuild,

                    // bundle all components CSS into a single file
                    css: css => {
                        css.write(`${buildPath}/bundle.css`, !isProductionBuild);
                    }
                }),

                resolve(),
                commonjs(),

                isProductionBuild && buble(),
                // isProductionBuild && buble({
                //     include: [
                //         "src/**",
                //         "node_modules/svelte/shared.js"
                //     ]
                // }),

                isProductionBuild && terser()
            ],
            cache: true
        },
        outputOpts: {
            file: `${buildPath}/bundle.js`,
            format: "iife",
            name: pkg.name,
            sourcemap: !isProductionBuild,
        }
    }
}

gulp.task("rollup.fullscreen", async function (done) {
    const {bundleOpts, outputOpts} = makeBuildConfig(
        {withNestaFooter: true},
        options.production
    );

    const bundle = await rollup(bundleOpts);
    await bundle.write(outputOpts);

    done();
});

gulp.task("rollup.embedded", async function (done) {
    const {bundleOpts, outputOpts} = makeBuildConfig(
        {withNestaFooter: false},
        options.production
    );

    const bundle = await rollup(bundleOpts);
    await bundle.write(outputOpts);

    done();
});

gulp.task("rollup", options.fullscreen
    ? gulp.parallel("rollup.embedded", "rollup.fullscreen")
    : gulp.task("rollup.embedded")
);

gulp.task("watch.src", done => {
    gulp.watch("src/**/*", gulp.series("rollup"));

    done();
});
