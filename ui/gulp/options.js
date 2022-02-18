import parseArgs from "minimist";

/*
npm run dev -- --option1 --option2
npm run deploy -- -m "deploy message"
*/

const options = parseArgs(process.argv.slice(2), {
    string: [
        "m", // npm run deploy -- -m "deploy message"
    ],
    boolean: [
        "fullscreen", // build
        "production", // build
        "push", // deploy
    ],
    default: {
        fullscreen: false,
        production: false,
        push: false
    }
});

console.log("options", options);

export default options;
