import App from "./components/App.html";
import AppStore from "./store.js";

const store = new AppStore();

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
