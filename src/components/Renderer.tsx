"use client";
import { useEffect, useRef } from "react";
import { VideoProcessor } from "./VideoProcessor";

const Renderer = () => {
  const videoElement = useRef<HTMLVideoElement>(null);
  const videoElement2 = useRef<HTMLVideoElement>(null);

  const handlePlayVideo = () => {
    if (videoElement.current) videoElement.current.play();
    if (videoElement2.current) videoElement2.current.play();
  };
  const handlePauseVideo = () => {
    if (videoElement.current) videoElement.current.pause();
    if (videoElement2.current) videoElement2.current.pause();
  };
  // Wait for the video to play
  // const videoElement: HTMLVideoElement = document.getElementById(
  //   "video"
  // ) as HTMLVideoElement;
  const canvasElement = useRef<HTMLCanvasElement>(null);
  // const canvasElement: HTMLCanvasElement | undefined =
  //   (document.getElementById("canvas") as HTMLCanvasElement) || undefined;
  useEffect(() => {
    if (videoElement.current)
      videoElement?.current.addEventListener(
        "play",
        (): void => {
          const video = videoElement.current ? videoElement.current : null;
          const video2 = videoElement2.current ? videoElement2.current : null;
          const canvas = canvasElement.current ? canvasElement.current : null;
          if (!video || !canvas || !video2) return;
          // Create video processor
          const videoProcessor: VideoProcessor = new VideoProcessor(
            video,
            canvas
          );
          const videoProcessor2: VideoProcessor = new VideoProcessor(
            video2,
            canvas
          );
          // Get notified if the video has ended
          let hasVideoEnded: boolean = false;
          video.addEventListener(
            "ended",
            (): void => {
              hasVideoEnded = true;
            },
            { once: true }
          );

          // Render frame
          let performanceProfilerResults: Array<any> = [];

          const renderFrame = (): void => {
            // Start performance profiling
            const beforeRender: number = performance.now();

            // Get raw image data, and somehow use it
            const beforeExtract: number = performance.now();

            const imageData: Uint8Array = videoProcessor.extractPixels();
            const imageData2: Uint8Array = videoProcessor2.extractPixels();

            //console.log("IMAGE DATA " + imageData);
            //console.log("IMAGE DATA 2 " + imageData2);
            if (imageData && imageData2)
              videoProcessor.updatePixels(imageData, imageData2);

            const afterExtract: number = performance.now();

            videoProcessor.renderVideoFrame();
            const afterRender: number = performance.now();

            // Save performance profiling results
            performanceProfilerResults.push({
              timestamp: new Date().toISOString(),
              renderDuration: afterRender - beforeRender,
              extractDuration: afterExtract - beforeExtract,
            });

            // Continue or stop
            if (hasVideoEnded) {
              console.log(
                JSON.stringify(performanceProfilerResults, null, "  ")
              );
              return;
            } else {
              requestAnimationFrame(renderFrame);
            }
          };

          // Start
          requestAnimationFrame(() => {
            requestAnimationFrame(renderFrame);
          });
        },
        { once: true }
      );
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>
        <button onClick={handlePlayVideo}> PLAY </button>
        <button onClick={handlePauseVideo}> PAUSE </button>

        <canvas
          ref={canvasElement}
          width="1920"
          height="1080"
          id="canvas"
        ></canvas>
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
        ></video>
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
      </div>
    </main>
  );
};

export default Renderer;
