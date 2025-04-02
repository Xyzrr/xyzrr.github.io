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
  font-family: Quicksand, sans-serif;
  line-height: 1.3;
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
    font-weight: 600;
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
          For the foreseeable future I'll be building{" "}
          <a href="https://matrices.dev?ref=johnqian.com" target="_blank">
            Matrices
          </a>{" "}
          as a cofounder. Previously I did eng and design at{" "}
          <a href="https://www.adept.ai/" target="_blank">
            Adept
          </a>
          ,{" "}
          <a href="https://wandb.com/" target="_blank">
            Weights & Biases
          </a>
          , and Google. I like writing concisely and making silky user
          experiences.
        </p>
        <p>
          Let me know if you want to meet up; I'm usually in SF. Am generally
          interested in meeting people I can meaningfully help or learn from.
        </p>
        <Links>
          <a href="https://projects.johnqian.com">Projects</a>
          <span>∙</span>
          <a href="https://blog.johnqian.com">Blog</a>
          <span>∙</span>
          <a href="mailto:johnlongqian+site@gmail.com">Contact</a>
          <span>∙</span>
          <a
            href="https://x.com/johnlqian"
            target="_blank"
            aria-label="X Profile"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
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
