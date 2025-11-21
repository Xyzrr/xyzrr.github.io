import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import QLearningPage from "./interactive-ml/pages/QLearningPage";
import HomePage from "./portfolio/pages/HomePage";
import TetrisPage from "./tetris/pages/TetrisPage";
import TestPage from "./portfolio/pages/TestPage";
import TextPage from "./text/pages/TextPage";
import ClipboardPage from "./clipboard/pages/ClipboardPage";
import GainsPage from "./portfolio/pages/GainsPage";

function App() {
  return (
    <>
      <Router>
        <Switch>
          <Route path="/tetris" exact component={TetrisPage}></Route>
          <Route path="/qlearning" exact component={QLearningPage}></Route>
          <Route path="/text" exact component={TextPage}></Route>
          <Route path="/clipboard" exact component={ClipboardPage}></Route>
          <Route path="/gains" exact component={GainsPage}></Route>
          <Route path="/" exact component={HomePage}></Route>
          <Route component={TestPage}></Route>
        </Switch>
      </Router>
    </>
  );
}

export default App;
