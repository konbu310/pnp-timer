import { useEffect, useRef, useState } from "react";

function App() {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const svgRef = useRef<SVGSVGElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const genImage = async () => {
    const svg = svgRef.current;
    const canvas = canvasRef.current;
    if (!svg || !canvas) return;
    const svgStr = new XMLSerializer().serializeToString(svg);
    const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
      svgStr
    )}`;
    const width = svg.scrollWidth;
    const height = svg.scrollHeight;
    const img = new Image(width, height);
    img.src = svgUrl;
    await img.decode();
    return img;
  };

  const setup = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const img = await genImage();
    if (!img) return;
    const ctx = canvas.getContext("2d")!;
    ctxRef.current = ctx;
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.clearRect(0, 0, img.width, img.height);
    ctx.drawImage(img, 0, 0, img.width, img.height);
    const stream = canvas.captureStream(60);
    video.srcObject = stream;
  };

  const togglePinP = () => {
    if (isLoading) return;
    const video = videoRef.current;
    if (!video) return;
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture();
      return;
    }
    video.requestPictureInPicture();
  };

  const playTimer = () => {
    const timer = window.setInterval(() => {
      setCount((c) => {
        if (c === 0) {
          window.clearInterval(timer);
          return c;
        } else {
          return c - 1;
        }
      });
    }, 1000);
  };

  useEffect(() => {
    navigator.mediaSession.setActionHandler("play", () => {
      console.log("Play");
      setCount((c) => c + 1);
    });

    navigator.mediaSession.setActionHandler("pause", () => {
      console.log("pause");
      setCount((c) => c + 1);
    });

    (async () => {
      await setup();
      setIsLoading(false);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const ctx = ctxRef.current;
      if (!ctx) return;
      const img = await genImage();
      if (!img) return;
      ctx.clearRect(0, 0, img.width, img.height);
      ctx.drawImage(img, 0, 0, img.width, img.height);
    })();
  }, [count]);

  return (
    <div className="App">
      <svg ref={svgRef} viewBox="0 0 256 256" width="256" height="256">
        <rect x="0" y="0" fill="white" width={256} height={256}></rect>
        <text
          x="50%"
          y="50%"
          fontSize={164}
          fontWeight="bold"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {count}
        </text>
      </svg>

      <canvas style={{ display: "none" }} ref={canvasRef}></canvas>

      <video
        ref={videoRef}
        autoPlay
        controls
        style={{ display: "none" }}
      ></video>

      <div>
        <button onClick={() => setCount((c) => c - 1)}>-</button>
        &emsp;
        <button onClick={playTimer}>▶</button>
        &emsp;
        <button onClick={() => setCount((c) => c + 1)}>+</button>
      </div>

      <div>
        <button style={{ opacity: isLoading ? 0.5 : 1 }} onClick={togglePinP}>
          Toggle PinP
        </button>
      </div>
    </div>
  );
}

export default App;
