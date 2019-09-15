import React from 'react';
import {BrowserRouter as Router, Route} from 'react-router-dom';

import QLearningPage from './pages/QLearningPage';

function Home() {
  return <div>Home</div>;
}

function DQNPage() {
  return <div>DQN</div>;
}

function App() {
  return (
    <Router>
      <Route path="/" exact component={Home} />
      <Route path="/qlearning" component={QLearningPage} />
      <Route path="/dqn" component={DQNPage} />
    </Router>
  );
}

export default App;
