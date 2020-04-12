const inputVideo = document.querySelector("#file"); // tag de elemento iput
const video = document.querySelector("#video"); // tag de video
const fileReader = new FileReader(); // instancia de FileReader
const mediaSource = new MediaSource(); // uma instancia de media source
let sourceBuffer; // Variavel que recebera a instancia de SourceBuffer

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

// Evento disparado quando o MediaSource é Aberto
mediaSource.onsourceopen = (e) => {
  console.log("mediaSource - open");
  // console.log(e);
  // Apos o MediaSource ser Aberto adicione um SourceBuffer a ele
  sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vorbis,vp8"');

  // Evento dispara quando o SourceBuffer esta em estado de update
  sourceBuffer.onupdate = (e) => {
    console.log("sourceBuffer - update");
    // console.log(e);
  };
  // Evento disparado quando o update do SourceBuffer chega ao fim
  sourceBuffer.onupdateend = (e) => {
    console.log("sourceBuffer - update end");
    // console.log(e, mediaSource);
  };
  // Evento disparado quando acontece algum erro no SourceBuffer
  sourceBuffer.onerror = (e) => {
    console.log("sourcebuffer - error");
    // console.log(e);
  };
};

// Evento Disparado quando um novo Buffer é carregado no FileReader
fileReader.onload = (e) => {
  console.log("fileReader - load");
  // console.log(e);

  // Caso o SourceBuffer nao esteja atualizando(!updating) e o MediaSource esteja aberto(open)
  if (!sourceBuffer.updating && mediaSource.readyState == "open") {
    sourceBuffer.appendBuffer(e.target.result); // Adicione o BufferArray(e.target.result) do FileReader ao SourceBuffer
  }
};

// Assim que o arquivo de video for carregado pelo input:file
inputVideo.addEventListener("change", () => {
  const file = inputVideo.files[0]; // Obter a instancia de File
  const size = file.size; // Obter a quantidade de bytes do arquivo
  let i = 1; // Inicializar o contador

  const chuckSize = size / 100; // Obter o tamanho medio de cada chuck(pedaço de bytes do arquivo)
  let chuckInitial = 0; // Inicializar o interador de chuck

  // A cada 100 milesimos de segundos pegar um pedaço do arquivo (chuck) e enviar para o fileReader atraves de um setInterval
  const interval = setInterval(() => {
    const chuck = file.slice(chuckInitial, chuckInitial + chuckSize); // Obter um pedaço de arquivo por interação
    fileReader.readAsArrayBuffer(chuck); // Enviar o pedaço de arquivo para o FileReader
    chuckInitial += chuckSize; // Incrementar o tamanho para a proxima interação
    i += 1; // Incrementar contador
    if (i >= 100 - 1) {
      // Quando contador chegar ao fim
      clearInterval(interval); // Limpar o setInterval
      mediaSource.endOfStream(); // Enviar um evento de fim de stream para o MediaSource
    }
  }, 100);
});
