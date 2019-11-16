import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import QLearningPage from "./pages/QLearningPage";
import HomePage from "./pages/HomePage";

function DQNPage() {
  return <div>DQN</div>;
}

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/qlearning">
          <QLearningPage></QLearningPage>
        </Route>
        <Route path="/dqn">
          <DQNPage></DQNPage>
        </Route>
        <Route path="/" exact>
          <HomePage></HomePage>
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
