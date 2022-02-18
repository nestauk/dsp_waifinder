import "./assets";
import "./readme";
import "./data";
import "./html";
import "./mapbox";
import "./modernizr";
import "./rollup";
import "./build";
import "./serve";
import "./default";
import "./deploy";

export const BUILD_PATH = "build";
export const BUILD_CSS_PATH = "build/css";

export const makeBuildSubpath = subpath => `${BUILD_PATH}/${subpath}`;
