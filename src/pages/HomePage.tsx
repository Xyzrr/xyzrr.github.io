import React from "react";
import styled from "styled-components";
import SnakeRenderer from "../components/SnakeRenderer";

const HomePageDiv = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-family: Quicksand;
  .bio {
    max-width: 400px;
    width: 100%;
    padding: 16px;
    font-size: 18px;
    margin-bottom: 80px;
  }
  .footer {
    position: absolute;
    right: 0;
    bottom: 0;
    padding: 24px 48px;
    font-size: 14px;
  }
  a {
    color: black;
    text-decoration: underline;
    text-decoration-color: transparent;
    font-weight: bold;
    transition: all 0.15s;
    &:hover {
      text-decoration-color: black;
    }
  }
`;

const HomePage: React.FC = () => {
  return (
    <HomePageDiv>
      <div className="bio">
        <p>Hey, I'm John. </p>
        <p>
          I currently do swe at{" "}
          <a href="https://www.wandb.com/">Weights & Biases</a>. Earlier I moved
          buttons around at Google and dropped out of UIUC. I like simplifying
          and prettifying things,{" "}
          <a href="https://www.blog.johnqian.com">writing</a>, and doing
          calisthenics. I idolize Paul Graham and Richard Feynman to an
          unreasonable extent.
        </p>
        <p>
          If you like my work, we should meet up. My email is johnlongqian (at)
          gmail.com.
        </p>
      </div>
      <div className="footer">
        <p>Background:</p>
        <p>
          <a href="https://github.com/Xyzrr/rl-snake">DQN playing Snake</a>
        </p>
      </div>
      <SnakeRenderer></SnakeRenderer>
    </HomePageDiv>
  );
};

export default HomePage;
