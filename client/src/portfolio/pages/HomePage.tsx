import React from "react";
import styled from "styled-components";
import SnakeRenderer from "../../snake/components/SnakeRenderer";
// import FluidShader from "../../shaders/components/FluidShader";

const HomePageDiv = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  position: fixed;
  width: 100%;
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
    padding: 16px;
    font-size: 14px;
    opacity: 0.6;
    p {
      margin: 0;
    }
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

const HomePageBackground = styled.div`
  position: absolute;
  z-index: -1;
  width: 100%;
  height: 100%;
`;

interface Theme {
  background: React.ReactNode;
  link: string;
  name: string;
}

const HomePage: React.FC = () => {
  const themes: { [key: string]: Theme } = {
    snake: {
      background: <SnakeRenderer></SnakeRenderer>,
      link: "https://github.com/Xyzrr/rl-snake",
      name: "DQN playing Snake",
    },
    // shader: {
    //   background: <FluidShader></FluidShader>,
    //   link: "#",
    //   name: "Shader",
    // },
  };
  let themeKey: string | null = null;
  if (window.location.hash) {
    themeKey = window.location.hash.substr(1);
  }
  if (!themeKey || !(themeKey in themes)) {
    const choices = Object.keys(themes);
    themeKey = choices[Math.floor(Math.random() * choices.length)];
  }
  const theme = themes[themeKey];

  return (
    <HomePageDiv>
      <HomePageBackground>{theme.background}</HomePageBackground>
      <div className="bio">
        <p>Hey, I'm John. </p>
        <p>
          I currently do swe at{" "}
          <a href="https://wandb.com/">Weights & Biases</a>. Earlier I moved
          buttons around at Google and dropped out of UIUC. I like simplifying
          and prettifying things,{" "}
          <a href="https://blog.johnqian.com">writing</a>, and doing
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
          <a href={theme.link}>{theme.name}</a>
        </p>
      </div>
    </HomePageDiv>
  );
};

export default HomePage;
