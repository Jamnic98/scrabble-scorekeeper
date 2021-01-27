import React from "react"
import ReactDOM from "react-dom"
import App from "./App"

window.addEventListener("keydown",
  function (e) {
    switch (e.keyCode) {
      case 37: case 38: case 39: case 40:
        e.preventDefault()
        break;
      default:
        break;
    }
  }, false)

ReactDOM.render(<App />, document.getElementById("root"))
