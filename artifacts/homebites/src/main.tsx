import { createRoot } from "react-dom/client";
import { setBaseUrl } from "@workspace/api-client-react";
import App from "./App";
import "./index.css";

const apiBasePath = import.meta.env.BASE_URL.replace(/\/$/, "");

setBaseUrl(apiBasePath === "" ? null : apiBasePath);

createRoot(document.getElementById("root")!).render(<App />);
