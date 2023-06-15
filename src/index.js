import React from "react";
import * as ReactDOM from 'react-dom';
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter } from "react-router-dom";
import "@fontsource/arimo";
import "@fontsource/poppins";
import "@celo/react-celo/lib/styles.css";
import { CeloProvider, Alfajores } from "@celo/react-celo";

ReactDOM.render(
  <BrowserRouter>
      <CeloProvider
      dapp={{
        name: "Register your phone number",
        description: "This app allows you to register a number with Celo",
        url: "https://example.com",
        icon: ""
      }}
      defaultNetwork={Alfajores.name}
    >
    <App />
    </CeloProvider>
  </BrowserRouter>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
