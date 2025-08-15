import * as React from "react";
//import ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";

import App from "./App.js";

jest.mock("./components/ConfigContext");

test("renders without crashing", () => { // eslint-disable-line jest/expect-expect

	const div = document.createElement("div");
	const root = createRoot(div);
	root.render(
		<React.StrictMode>
			<App />
		</React.StrictMode>
	);

	//const div = document.createElement("div");
	//ReactDOM.render(<App />, div);
	//ReactDOM.unmountComponentAtNode(div);
});
