"use client";
import { VideoToFrames, VideoToFramesMethod } from "./VideoToFrame";
import { useEffect, useRef, useState } from "react";
import VideoExtractionMain from "@/components/VideoExtractionMain";
import Image from "next/image";
import { OffthreadVideo, staticFile } from "remotion";
import Replicate from "replicate";
// const videoSrc = import( "../../public/assets/61092.mp4");
// import videoSrc2 from "../../public/assets/61463.mp4";

const REPLICATE_API_TOKEN = (
  <r8_8PKuQYnKlVuEdu9tgRgbDBOBUqyyahA2te7xF></r8_8PKuQYnKlVuEdu9tgRgbDBOBUqyyahA2te7xF>
);

const Main = () => {
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });

  const videoElement = useRef<HTMLVideoElement>(null);
  const videoElement2 = useRef<HTMLVideoElement>(null);
  const [lastFrame, setLastFrame] = useState<any>();
  const [firstFrame, setFirstFrame] = useState<any>();

  const video = staticFile("assets/61092.mp4"); //videoElement.current ? videoElement.current : null;
  const video2 = staticFile("assets/61463.mp4"); //videoElement2.current ? videoElement2.current : null;
  //const video1 =
  //if (!videoElement.current || !videoElement2.current) return;
  useEffect(() => {
    if (video && video2) {
      const func = async () => {
        let buff = await VideoExtractionMain(video, false);
        setLastFrame(buff);
        console.log(buff);
        buff = await VideoExtractionMain(video2, true);
        setFirstFrame(buff);
        console.log(buff);
      };
      func();
    }
  }, [videoElement, videoElement2]);

  console.log(videoElement.current);
  console.log(videoElement2.current);
  console.log(lastFrame);
  console.log(firstFrame);

  const morph = async () => {
    const output = await replicate.run(
      "google-research/frame-interpolation:4f88a16a13673a8b589c18866e540556170a5bcb2ccdc12de556e800e9456d3d",
      {
        input: {
          frame1: lastFrame,
          // "https://replicate.delivery/mgxm/5de85319-a354-4178-a2b0-aab4a65fa480/start.png",
          frame2: firstFrame,
          //"https://replicate.delivery/mgxm/aebabf54-c730-4efe-857d-1182960918d4/end.png",
          times_to_interpolate: 7,
        },
      }
    );
    console.log(output);
  };
  morph();

  return (
    <>
      <div>
        <Image src={firstFrame} alt="first frame" width="1280" height="720" />
        <Image src={lastFrame} alt="last frame" width="1280" height="720" />
      </div>
      <p>Something</p>
      <video
        ref={videoElement}
        width="1280"
        height="720"
        //src={"/assets/buff2.mp4"}
        src={"/assets/61092.mp4"}
        id="video"
        autoPlay={false}
        controls
        hidden={false}
        muted
      ></video>{" "}
      {true && (
        <video
          ref={videoElement2}
          width="1280"
          height="720"
          //src={"/assets/buff.mp4"}
          src={"/assets/61463.mp4"}
          id="video"
          autoPlay={false}
          controls
          hidden={false}
          muted
        ></video>
      )}
    </>
  );
};

export default Main;
