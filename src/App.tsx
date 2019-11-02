import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";

import QLearningPage from "./pages/QLearningPage";
import HomePage from "./pages/HomePage";

function DQNPage() {
  return <div>DQN</div>;
}

function App() {
  return (
    <Router>
      <Route path="/" exact component={HomePage} />
      <Route path="/qlearning" component={QLearningPage} />
      <Route path="/dqn" component={DQNPage} />
    </Router>
  );
}

export default App;
