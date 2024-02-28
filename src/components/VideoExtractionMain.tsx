"use client";
//import "./styles.css";
import { VideoToFrames, VideoToFramesMethod } from "./VideoToFrame";
import { useState } from "react";

// eslint-disable-next-line @next/next/no-async-client-component
const VideoExtractionMain = async (video: any, getFirstFrame: boolean) => {
  //const [file] = event.target.files;
  console.log("IN FUNCTION");
  const file = video;
  const fileUrl = video; //URL.createObjectURL(file);
  const frames = await VideoToFrames.getFrames(
    fileUrl,
    30,
    VideoToFramesMethod.totalFrames
  );

  //};

  const now = new Date().toDateString();

  if (getFirstFrame) return frames[0];
  else return frames[frames.length - 1];
};
/*return (
    <>
      <div className="container">
        <h1>Get frames from video 🎞</h1>
        <p>Upload a video, then click the images you want to download!</p>
        <label>
          {status === "IDLE" ? (
            "Choose file"
          ) : (
            <p>Doom</p>
            //<Loader type="Circles" color="#00BFFF" height={100} width={100} />
          )}
          <input
            type="file"
            className="visually-hidden"
            accept="video/*"
            onChange={onInput}
          />
        </label>

        {images?.length > 0 && (
          <div className="output">
            {images.map((imageUrl, index) => (
              <a
                key={imageUrl}
                href={imageUrl}
                download={`${now}-${index + 1}.png`}
              >
                <span>
                  
                  Download image number {index + 1}
                </span>
                <img src={imageUrl} alt="" />
              </a>
            ))}
          </div>
        )}
      </div>
    </>
  );
  */
//};

export default VideoExtractionMain;
