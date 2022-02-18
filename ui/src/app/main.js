import App from "./components/App.html";
import Store from "./store.js";

const store = new Store();

const app = new App({
    target: document.body,
    store,
    data: {
        mapWithScaleControl: false,
        mapWithZoomControl: true,
        withNestaFooter: WITH_NESTA_FOOTER, // to be replaced by rollup
    }
});

export default app;
