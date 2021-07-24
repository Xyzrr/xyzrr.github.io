import styled from "styled-components";

export const Wrapper = styled.div`
  h1 {
    font-family: Quicksand;
    text-align: center;
    margin-top: 64px;
    margin-bottom: 64px;
  }
`;

export const Items = styled.div`
  display: flex;
  gap: 48px;
  width: min(700px, 100vw - 48px);
  margin: 0 auto;
  flex-wrap: wrap;
  justify-content: center;
`;

export const Item = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  width: 160px;
  video {
    width: 160px;
    height: 160px;
    object-fit: cover;
    border-radius: 4px;
    background: #f2f2f2;
  }

  @media (max-width: 768px) {
    width: 108px;
    video {
      width: 108px;
      height: 108px;
    }
  }
`;

export const ItemTitle = styled.div`
  margin-top: 8px;
  margin-left: -16px;
  margin-right: -16px;
  font-family: Quicksand;
  text-align: center;
`;

export const HoverVideo = styled.video`
  transition: filter 0.4s;
  filter: grayscale(100%);
  &:hover {
    filter: grayscale(0%);
  }
`;
