import { Average } from "next/font/google";

/**
 * Video processor
 */
export class VideoProcessor {
  /**
   * Video element
   */
  private readonly videoElement: HTMLVideoElement;

  /**
   * Width
   */
  private readonly videoWidth: number;

  /**
   * Height
   */
  private readonly videoHeight: number;

  /**
   * Video Image Data
   */
  private imageData: ImageData;
  /**
   * Video Image Data
   */
  private shouldUseImageData: boolean;

  /**
   * Canvas context
   */
  private readonly webgl: WebGL2RenderingContext;

  /**
   * Constructor
   */
  constructor(
    videoElement: HTMLVideoElement,
    canvasElement: HTMLCanvasElement
  ) {
    // Save video information
    this.videoElement = videoElement;
    this.videoWidth = this.videoElement.videoWidth;
    this.videoHeight = this.videoElement.videoHeight;

    this.imageData = new ImageData(this.videoWidth, this.videoHeight);
    this.shouldUseImageData = false;

    // Create in-memory canvas
    const actualCanvasElement =
      canvasElement || (document.createElement("canvas") as HTMLCanvasElement);
    actualCanvasElement.width = this.videoWidth;
    actualCanvasElement.height = this.videoHeight;

    // Get context
    // Configure all kinds to stuff to get the best possible performance
    this.webgl = actualCanvasElement.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      powerPreference: "high-performance",
      premultipliedAlpha: false,
    }) as WebGL2RenderingContext;

    // Setup
    this.setupCanvas();
  }

  /**
   * Render video frame
   */
  public renderVideoFrame(): void {
    if (this.shouldUseImageData) {
      this.webgl.texImage2D(
        this.webgl.TEXTURE_2D,
        0,
        this.webgl.RGBA,
        this.webgl.RGBA,
        this.webgl.UNSIGNED_BYTE,
        this.imageData
      );
      this.shouldUseImageData = false;

      console.log("USED IMAGE DATA");
      //console.log(this.imageData);
    } else {
      this.webgl.texImage2D(
        this.webgl.TEXTURE_2D,
        0,
        this.webgl.RGBA,
        this.webgl.RGBA,
        this.webgl.UNSIGNED_BYTE,
        this.videoElement
      );
      console.log("USED VIDEO ELEMENT");
    }
    this.webgl.drawArrays(this.webgl.TRIANGLE_FAN, 0, 4);
  }

  /**
   * Extract video pixels
   */
  public extractPixels(): Uint8Array {
    const pixels: Uint8Array = new Uint8Array(
      this.videoWidth * this.videoHeight * 4
    );
    this.webgl.readPixels(
      0,
      0,
      this.videoWidth,
      this.videoHeight,
      this.webgl.RGBA,
      this.webgl.UNSIGNED_BYTE,
      pixels
    );

    // console.log(pixelRGBA);
    return pixels;
  }

  public updatePixels(pixels: Uint8Array, pixels2?: Uint8Array): void {
    let updatedPixels: Uint8Array = new Uint8Array(pixels);

    //console.log("NULL CHECK ", pixels === null);
    //console.log("UNDEFINED CHECK ", pixels === undefined);
    //console.log("IMAGE DATA ", pixels[0] == updatedPixels[0]);
    //console.log("IMAGE DATA MERGE " + updatedPixels);

    //let data: ImageData;
    if (!pixels2) return;
    for (let i = 0; i < pixels.length; i += 4) {
      ///RED
      updatedPixels[i] =
        pixels[i] !== pixels2[i] ? (pixels[i] + pixels2[i]) / 2 : pixels[i];
      ///GREEN
      updatedPixels[i + 1] =
        pixels[i + 1] !== pixels2[i + 1]
          ? (pixels[i + 1] + pixels2[i + 1]) / 2
          : pixels[i + 1];
      ///BLUE
      updatedPixels[i + 2] =
        pixels[i + 2] !== pixels2[i + 2]
          ? (pixels[i + 2] + pixels2[i + 2]) / 2
          : pixels[i + 2];
      ///ALPHA
      updatedPixels[i + 3] =
        pixels[i + 3] !== pixels2[i + 3]
          ? (pixels[i + 3] + pixels2[i + 3]) / 2
          : 255;
      // if (pixels[i] != pixels2[i]) {
      //   console.log("1 " + pixels[i]);
      //   console.log("2 " + pixels2[i]);
      //   console.log("m " + updatedPixels[i]);
      // }
    }
    console.log("IMAGE DATA ");
    console.log(pixels);
    console.log(pixels2);
    console.log(updatedPixels);

    // Upload the updated pixel data to the texture

    const buff = new Uint8ClampedArray(updatedPixels);

    this.imageData = new ImageData(buff, this.videoWidth, this.videoHeight);
    //if (this.imageData != new ImageData(this.videoWidth, this.videoHeight))
    this.shouldUseImageData = true;
    // console.log(updatedPixels);
    // console.log(buff);
    // console.log(this.imageData);

    // this.webgl.texImage2D(
    //   this.webgl.TEXTURE_2D, //target
    //   0, //level
    //   this.webgl.RGBA, //internalFormat
    //   this.videoWidth, //width
    //   this.videoHeight, //height
    //   0, //border
    //   this.webgl.RGBA, //format
    //   this.webgl.UNSIGNED_BYTE, //type
    //   updatedPixels, //pixels,
    //   0
    // );
    // this.webgl.texImage2D(
    //   this.webgl.TEXTURE_2D, //target
    //   0, //level
    //   this.webgl.RGBA, //internalFormat
    //   this.webgl.RGBA, //format
    //   this.webgl.UNSIGNED_BYTE, //type
    //   this.imageData //source
    // );
    // this.webgl.drawArrays(this.webgl.TRIANGLE_FAN, 0, 4);
    this.renderVideoFrame();
  }

  /**
   * Setup canvas
   */
  private setupCanvas(): void {
    // Define vertex shader
    const vertexShaderSource: string = `
      precision mediump float;

      attribute vec2 aVertex;
      attribute vec2 aUV;
      varying vec2 vTex;

      void main() {
        gl_Position = vec4(aVertex, 0.0, 1.0);
        vTex = vec2(aUV.s, 1.0 - aUV.t);
      }
    `;
    const vertexShader: WebGLShader = this.webgl.createShader(
      this.webgl.VERTEX_SHADER
    ) as WebGLShader;
    this.webgl.shaderSource(vertexShader, vertexShaderSource);
    this.webgl.compileShader(vertexShader);

    // Define fragment shader
    const fragmentShaderSource: string = `
      precision mediump float;

      uniform sampler2D sampler0;
      varying vec2 vTex;

      void main(){
        gl_FragColor = texture2D(sampler0, vTex);
      }
    `;
    const fragmentShader: WebGLShader = this.webgl.createShader(
      this.webgl.FRAGMENT_SHADER
    ) as WebGLShader;
    this.webgl.shaderSource(fragmentShader, fragmentShaderSource);
    this.webgl.compileShader(fragmentShader);

    // Create program
    const program = this.webgl.createProgram() as WebGLProgram;
    this.webgl.attachShader(program, vertexShader);
    this.webgl.attachShader(program, fragmentShader);
    this.webgl.linkProgram(program);
    this.webgl.useProgram(program);

    // Disable depth test
    this.webgl.disable(this.webgl.DEPTH_TEST);

    // Turn off rendering to alpha
    this.webgl.colorMask(true, true, true, false);

    // Create vertex buffer
    const vertexBuffer: WebGLBuffer = this.webgl.createBuffer() as WebGLBuffer;
    this.webgl.bindBuffer(this.webgl.ARRAY_BUFFER, vertexBuffer);
    this.webgl.bufferData(
      this.webgl.ARRAY_BUFFER,
      new Float32Array([-1, 1, -1, -1, 1, -1, 1, 1]),
      this.webgl.STATIC_DRAW
    );

    // Create texture buffer
    const textureBuffer: WebGLBuffer = this.webgl.createBuffer() as WebGLBuffer;
    this.webgl.bindBuffer(this.webgl.ARRAY_BUFFER, textureBuffer);
    this.webgl.bufferData(
      this.webgl.ARRAY_BUFFER,
      new Float32Array([0, 1, 0, 0, 1, 0, 1, 1]),
      this.webgl.STATIC_DRAW
    );

    const vloc: number = this.webgl.getAttribLocation(program, "aVertex");
    this.webgl.enableVertexAttribArray(vloc);
    this.webgl.bindBuffer(this.webgl.ARRAY_BUFFER, vertexBuffer);
    this.webgl.vertexAttribPointer(vloc, 2, this.webgl.FLOAT, false, 0, 0);

    const tloc: number = this.webgl.getAttribLocation(program, "aUV");
    this.webgl.enableVertexAttribArray(tloc);
    this.webgl.bindBuffer(this.webgl.ARRAY_BUFFER, textureBuffer);
    this.webgl.vertexAttribPointer(tloc, 2, this.webgl.FLOAT, false, 0, 0);

    // // Get the location of the uniform variable in the shader
    // const samplerLocation = this.webgl.getUniformLocation(program, "sampler0");

    // // Set the value of the uniform variable to the texture unit
    // this.webgl.uniform1i(samplerLocation, 0); // Assuming you bound the texture to texture unit 0
    // console.log(samplerLocation);

    // Create texture
    const texture: WebGLTexture = this.webgl.createTexture() as WebGLTexture;
    this.webgl.bindTexture(this.webgl.TEXTURE_2D, texture);
    this.webgl.texParameteri(
      this.webgl.TEXTURE_2D,
      this.webgl.TEXTURE_WRAP_S,
      this.webgl.CLAMP_TO_EDGE
    );
    this.webgl.texParameteri(
      this.webgl.TEXTURE_2D,
      this.webgl.TEXTURE_WRAP_T,
      this.webgl.CLAMP_TO_EDGE
    );
    this.webgl.texParameteri(
      this.webgl.TEXTURE_2D,
      this.webgl.TEXTURE_MIN_FILTER,
      this.webgl.LINEAR
    );
  }
}
