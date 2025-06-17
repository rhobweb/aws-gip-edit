import * as React from "react";
import ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";

import App from "./App";

jest.mock("./components/ConfigContext");

it("renders without crashing", () => {

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
