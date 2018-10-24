import React from "react";
import ReactDOM from "react-dom";
import "./example.css";
import CircleMesh from "../../";

const App = () => (
  <div className="App">
    <CircleMesh colors={[0xac1122, 0x96789f, 0x535353]} />
    <h1>Circle Mesh Demo</h1>
  </div>
);

ReactDOM.render(<App />, document.getElementById("root"));

// Hot Module Replacement
if (module.hot) {
  module.hot.accept();
}
