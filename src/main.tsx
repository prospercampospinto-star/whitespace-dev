import { createRoot } from "react-dom/client";
import { World } from "./core/World";

document.documentElement.style.margin = "0";
document.documentElement.style.width = "100%";
document.documentElement.style.height = "100%";
document.body.style.margin = "0";
document.body.style.width = "100%";
document.body.style.height = "100%";

const rootElement = document.getElementById("root");

if (!rootElement) {
	throw new Error('Missing root element with id "root".');
}

rootElement.style.position = "fixed";
rootElement.style.inset = "0";

createRoot(rootElement).render(<World />);
