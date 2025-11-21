import * as S from "./GainsPage.styles";
import React from "react";

interface HoverVideoProps {
  src?: string;
  thumbnailTime?: number;
}

const HoverVideo: React.FC<HoverVideoProps> = ({ src, thumbnailTime }) => {
  const ref = React.useRef<HTMLVideoElement>(null);
  React.useEffect(() => {
    if (ref.current) {
      ref.current.currentTime = thumbnailTime || 0;
      ref.current.pause();
    }
  }, []);

  return (
    <S.HoverVideo
      ref={ref}
      src={src}
      autoPlay
      // muted
      playsInline
      onTouchStart={(e) => {
        e.currentTarget.currentTime = 0;
        e.currentTarget.play();
      }}
      onTouchEnd={(e) => {
        e.currentTarget.currentTime = thumbnailTime || 0;
        e.currentTarget.pause();
      }}
      onMouseEnter={(e) => {
        e.currentTarget.currentTime = 0;
        try {
          e.currentTarget.play();
        } catch {}
      }}
      onMouseLeave={(e) => {
        e.currentTarget.currentTime = thumbnailTime || 0;
        try {
          e.currentTarget.pause();
        } catch {}
      }}
    />
  );
};

const items = [
  {
    title: "10 muscle ups",
    src: "https://storage.googleapis.com/john-gains/10%20muscle%20ups.mp4",
    thumbnailTime: 5,
  },
  {
    title: "1 one arm pullup",
    src: "https://storage.googleapis.com/john-gains/one%20arm%20pullup.mp4",
    thumbnailTime: 7.8,
  },
  {
    title: "Tuck front lever",
    src: "https://storage.googleapis.com/john-gains/tuck%20front%20lever.mov",
    thumbnailTime: 6,
  },
  {
    title: "5 pistol squats",
    src: "https://storage.googleapis.com/john-gains/5%20pistol%20squats.mp4",
    thumbnailTime: 8,
  },
];

const GainsPage: React.FC = (props) => {
  return (
    <S.Wrapper>
      <h1>Progress</h1>
      <S.Items>
        {items.map((item) => {
          return (
            <S.Item>
              <HoverVideo src={item.src} thumbnailTime={item.thumbnailTime} />
              <S.ItemTitle>{item.title}</S.ItemTitle>
            </S.Item>
          );
        })}
      </S.Items>
    </S.Wrapper>
  );
};

export default GainsPage;
