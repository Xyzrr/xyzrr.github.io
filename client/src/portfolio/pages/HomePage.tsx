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
    max-width: 380px;
    width: calc(100vw - 48px);
    padding: 16px;
    font-size: 18px;
    margin-bottom: 80px;
  }
  .footer {
    position: absolute;
    right: 0;
    bottom: 0;
    padding: 24px;
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

export const Links = styled.div`
  display: flex;
  justify-content: space-between;
  a {
    font-weight: 400;
    color: #666;
    cursor: pointer;
    &:hover {
      color: black;
    }
  }
  span {
    color: #666;
  }
`;

interface Theme {
  background: React.ReactNode;
  link: string;
  name: string;
}

const HomePage: React.FC = (props) => {
  console.log("props", props);

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
          I currently do design and eng at{" "}
          <a href="https://wandb.com/">Weights & Biases</a>. Earlier I moved
          buttons around at Google and dropped out of UIUC. I like making
          powerful tools with silky user experiences.
        </p>
        <p>
          If you might like to build something with me, let's grab burritos.
        </p>
        <Links>
          <a href="https://projects.johnqian.com">Projects</a>
          <span>∙</span>
          <a href="https://blog.johnqian.com">Blog</a>
          <span>∙</span>
          <a href="/gains">Gains</a>
          <span>∙</span>
          <a href="mailto:johnlongqian+site@gmail.com">Contact</a>
        </Links>
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
