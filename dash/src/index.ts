// cSpell:disable

import axios, { AxiosInstance } from "axios";
import { promisify } from "es6-promisify";
import { IMPDObject, IVideoRepresentation } from "./interfaces";
import { parseString } from "xml2js";
import { EventEmitter } from "events";

const parser: Function = promisify(parseString);

export class Player {
  private mediaSource: MediaSource = new MediaSource();
  private video: HTMLVideoElement = document.querySelector("#video");
  private mpdObject: IMPDObject;
  private audioSourceBuffer: SourceBuffer;
  private videoSourceBuffer: SourceBuffer;
  private chuckMedia = new EventEmitter();

  private client: AxiosInstance = axios.create({
    baseURL: "http://localhost:5500",
  });

  constructor() {
    this.core();
  }

  getBandwidthAndCodec(videoSet) {
    const bandwidth = window.navigator["connection"].downlink * 1000000;
    const bandwidthIndex = videoSet.representation.map((value, index) => {
      return bandwidth > parseInt(value.bandwidth) ? index : 0;
    });
    const videoIndex = Math.max(...bandwidthIndex);
    const videoMimeType = `${videoSet.mimeType};codecs="${videoSet.representation[videoIndex].codecs}"`;

    console.log(
      "wxh",
      videoSet.representation[videoIndex].width,
      videoSet.representation[videoIndex].height
    );
    return { bandwidth, videoIndex, videoMimeType };
  }

  async core() {
    const streamMpdFile = await this.video.getAttribute("data-src");
    const response = await this.client.get(streamMpdFile);
    this.mpdObject = await parser(response.data);
    const videoSet = await this.simplifyVideoSet();
    const audioSet = await this.simplifyAudioSet();
    this.video.src = await URL.createObjectURL(this.mediaSource);

    let chuckNumber = parseInt(videoSet.startNumber) - 1;

    let lastBandWidth = null;

    this.chuckMedia.on(
      "download",
      async (chuckVideo, chuckAudio, chuckNumber) => {
        setTimeout(async () => {
          try {
            if (this.mediaSource.readyState !== "ended") {
              const videoResponse = await this.client.get(chuckVideo, {
                responseType: "arraybuffer",
              });
              const audioResponse = await this.client.get(chuckAudio, {
                responseType: "arraybuffer",
              });
              if (videoResponse.status === 200) {
                if (
                  !this.videoSourceBuffer.updating &&
                  this.mediaSource.readyState == "open"
                ) {
                  await this.videoSourceBuffer.appendBuffer(videoResponse.data);
                }
              }
              if (audioResponse.status === 200) {
                if (
                  !this.audioSourceBuffer.updating &&
                  this.mediaSource.readyState == "open"
                ) {
                  await this.audioSourceBuffer.appendBuffer(audioResponse.data);
                }
              }
              await this.chuckMedia.emit("load");
            }
          } catch (e) {
            console.error(e);
          }
        }, chuckNumber);
      }
    );

    this.chuckMedia.on("load", () => {
      let chuckVideo;
      let chuckAudio;

      const { bandwidth, videoIndex } = this.getBandwidthAndCodec(videoSet);

      if (chuckNumber === 0) {
        chuckVideo = videoSet.initialization.replace(
          "$RepresentationID$",
          videoSet.representation[videoIndex].id
        );
        chuckAudio = audioSet.initialization.replace(
          "$RepresentationID$",
          audioSet.id
        );
      } else {
        chuckVideo = videoSet.media
          .replace("$RepresentationID$", videoSet.representation[videoIndex].id)
          .replace("$Number$", String(chuckNumber));

        chuckAudio = audioSet.media
          .replace("$RepresentationID$", audioSet.id)
          .replace("$Number$", String(chuckNumber));
      }

      if (bandwidth !== lastBandWidth && chuckNumber !== 0) {
        chuckVideo = videoSet.initialization.replace(
          "$RepresentationID$",
          videoSet.representation[videoIndex].id
        );
        chuckAudio = audioSet.initialization.replace(
          "$RepresentationID$",
          audioSet.id
        );
      } else {
        chuckNumber += 1;
      }
      lastBandWidth = bandwidth;

      this.chuckMedia.emit(
        "download",
        "output/" + chuckVideo,
        "output/" + chuckAudio,
        chuckNumber
      );
    });

    this.mediaSource.onsourceopen = (e) => {
      console.log(e);
      let { videoMimeType } = this.getBandwidthAndCodec(videoSet);

      const audioMimeType = `${audioSet.mimeType};codecs="${audioSet.codecs}"`;
      if (window.MediaSource.isTypeSupported(audioMimeType)) {
        this.audioSourceBuffer = this.mediaSource.addSourceBuffer(
          audioMimeType
        );
        // this.audioSourceBuffer.mode = "sequence";
      }
      if (window.MediaSource.isTypeSupported(videoMimeType)) {
        this.videoSourceBuffer = this.mediaSource.addSourceBuffer(
          videoMimeType
        );
        // this.videoSourceBuffer.mode = "sequence";
      }
    };

    this.mediaSource.onsourceclose = (e) => {
      console.log(e);
    };

    this.mediaSource.onsourceended = (e) => {
      console.log(e);
    };

    this.chuckMedia.emit("load");
  }

  async simplifyVideoSet() {
    return {
      maxHeight: this.mpdObject.MPD.Period[0].AdaptationSet[0].$.maxHeight,
      maxWidth: this.mpdObject.MPD.Period[0].AdaptationSet[0].$.maxWidth,
      mimeType: this.mpdObject.MPD.Period[0].AdaptationSet[0].$.mimeType,
      segmentAlignment: this.mpdObject.MPD.Period[0].AdaptationSet[0].$
        .segmentAlignment,
      startWithSAP: this.mpdObject.MPD.Period[0].AdaptationSet[0].$
        .startWithSAP,
      duration: this.mpdObject.MPD.Period[0].AdaptationSet[0].SegmentTemplate[0]
        .$.duration,
      initialization: this.mpdObject.MPD.Period[0].AdaptationSet[0]
        .SegmentTemplate[0].$.initialization,
      media: this.mpdObject.MPD.Period[0].AdaptationSet[0].SegmentTemplate[0].$
        .media,
      startNumber: this.mpdObject.MPD.Period[0].AdaptationSet[0]
        .SegmentTemplate[0].$.startNumber,
      timescale: this.mpdObject.MPD.Period[0].AdaptationSet[0]
        .SegmentTemplate[0].$.timescale,
      representation: this.mpdObject.MPD.Period[0].AdaptationSet[0].Representation.map(
        (value: IVideoRepresentation) => {
          return {
            bandwidth: value.$.bandwidth,
            codecs: value.$.codecs,
            frameRate: value.$.frameRate,
            height: value.$.height,
            id: value.$.id,
            width: value.$.width,
            scanType: value.$.scanType,
          };
        }
      ),
    };
  }

  async simplifyAudioSet() {
    return {
      mimeType: this.mpdObject.MPD.Period[0].AdaptationSet[1].$.mimeType,
      segmentAlignment: this.mpdObject.MPD.Period[0].AdaptationSet[1].$
        .segmentAlignment,
      startWithSAP: this.mpdObject.MPD.Period[0].AdaptationSet[1].$
        .startWithSAP,
      duration: this.mpdObject.MPD.Period[0].AdaptationSet[1].SegmentTemplate[0]
        .$.duration,
      initialization: this.mpdObject.MPD.Period[0].AdaptationSet[1]
        .SegmentTemplate[0].$.initialization,
      media: this.mpdObject.MPD.Period[0].AdaptationSet[1].SegmentTemplate[0].$
        .media,
      startNumber: this.mpdObject.MPD.Period[0].AdaptationSet[1]
        .SegmentTemplate[0].$.startNumber,
      timescale: this.mpdObject.MPD.Period[0].AdaptationSet[1]
        .SegmentTemplate[0].$.timescale,
      bandwidth: this.mpdObject.MPD.Period[0].AdaptationSet[1].Representation[0]
        .$.bandwidth,
      codecs: this.mpdObject.MPD.Period[0].AdaptationSet[1].Representation[0].$
        .codecs,
      id: this.mpdObject.MPD.Period[0].AdaptationSet[1].Representation[0].$.id,
      audioSamplingRate: this.mpdObject.MPD.Period[0].AdaptationSet[1]
        .Representation[0].$.audioSamplingRate,
    };
  }
}

new Player();
