import React from "https://esm.sh/react@18.3.1";
import { createRoot } from "https://esm.sh/react-dom@18.3.1/client";
import { siteContent } from "/site/content.js";
import { HomePage } from "/site/components.js";

createRoot(document.getElementById("root")).render(React.createElement(HomePage, { content: siteContent }));
