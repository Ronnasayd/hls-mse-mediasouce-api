const inputVideo = document.querySelector("#file"); // tag de elemento iput
const video = document.querySelector("#video"); // tag de video
const videoFileReader = new FileReader(); // instancia de videoFileReader
const audioFileReader = new FileReader();
const mediaSource = new MediaSource(); // uma instancia de media source
let videoSourceBuffer = null; // Variavel que recebera a instancia de videoSourceBuffer
let audioSourceBuffer = null;

video.src = window.URL.createObjectURL(mediaSource); // instancia o src do video para o objeto MediaSource

// Evento disparado quando o MediaSource é Finalizado
mediaSource.onsourceended = (e) => {
  console.log("mediaSource - end");
  // console.log(e);
};
// Evento disparado quando o MediaSource é Fechado
mediaSource.onsourceclose = (e) => {
  console.log("mediaSource - close");
  // console.log(e);
};

mediaSource.onsourceopen = (e) => {
  console.log("mediaSource - open");
  videoSourceBuffer = mediaSource.addSourceBuffer(
    'video/mp4; codecs="avc1.64001F"'
  );
  audioSourceBuffer = mediaSource.addSourceBuffer(
    'video/mp4; codecs="mp4a.40.2"'
  );
};

// Evento Disparado quando um novo Buffer é carregado no videoFileReader
videoFileReader.onload = (e) => {
  console.log("videoFileReader - load");
  // console.log(e);

  if (!videoSourceBuffer.updating && mediaSource.readyState == "open") {
    videoSourceBuffer.appendBuffer(e.target.result);
  }
};

audioFileReader.onload = (e) => {
  console.log("audioFileReader - load");
  // console.log(e);

  if (!audioSourceBuffer.updating && mediaSource.readyState == "open") {
    audioSourceBuffer.appendBuffer(e.target.result);
  }
};

const videoFiles = [
  "/video/avc1/init.mp4",
  "/video/avc1/seg-1.m4s",
  "/video/avc1/seg-2.m4s",
  "/video/avc1/seg-3.m4s",
  "/video/avc1/seg-4.m4s",
  "/video/avc1/seg-5.m4s",
  "/video/avc1/seg-6.m4s",
  "/video/avc1/seg-7.m4s",
  "/video/avc1/seg-8.m4s",
  "/video/avc1/seg-9.m4s",
  "/video/avc1/seg-10.m4s",
  "/video/avc1/seg-11.m4s",
  "/video/avc1/seg-12.m4s",
  "/video/avc1/seg-13.m4s",
  "/video/avc1/seg-14.m4s",
  "/video/avc1/seg-15.m4s",
];

const audioFiles = [
  "/audio/und/mp4a/init.mp4",
  "/audio/und/mp4a/seg-1.m4s",
  "/audio/und/mp4a/seg-2.m4s",
  "/audio/und/mp4a/seg-3.m4s",
  "/audio/und/mp4a/seg-4.m4s",
  "/audio/und/mp4a/seg-5.m4s",
  "/audio/und/mp4a/seg-6.m4s",
  "/audio/und/mp4a/seg-7.m4s",
  "/audio/und/mp4a/seg-8.m4s",
  "/audio/und/mp4a/seg-9.m4s",
  "/audio/und/mp4a/seg-10.m4s",
  "/audio/und/mp4a/seg-11.m4s",
  "/audio/und/mp4a/seg-12.m4s",
  "/audio/und/mp4a/seg-13.m4s",
  "/audio/und/mp4a/seg-14.m4s",
  "/audio/und/mp4a/seg-15.m4s",
];

videoFiles.forEach((file, index) => {
  setTimeout(async () => {
    const data = await (await fetch(file)).blob();
    videoFileReader.readAsArrayBuffer(data);
  }, 200 * (index + 1));
});

audioFiles.forEach((file, index) => {
  setTimeout(async () => {
    const data = await (await fetch(file)).blob();
    audioFileReader.readAsArrayBuffer(data);
  }, 200 * (index + 1));
});
