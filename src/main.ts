import "./main.css";

import { Application } from "@infrastructure";

const application = new Application();

if (import.meta.hot) {
	import.meta.hot.accept();

	import.meta.hot.dispose(() => {
		application.dispose();
	});
}
