export interface ISegmentTemplate {
  $: {
    duration: string;
    initialization: string;
    media: string;
    startNumber: string;
    timescale: string;
  };
}
export interface IVideoRepresentation {
  $: {
    bandwidth: string;
    codecs: string;
    frameRate: string;
    height: string;
    id: string;
    scanType: string;
    width: string;
  };
}

export interface IMPDObject {
  MPD: {
    $: {
      mediaPresentationDuration: string;
      minBufferTime: string;
      profiles: string;
      type: string;
      xmlns: string;
    };
    Period: [
      {
        AdaptationSet: [
          {
            $: {
              maxHeight: string;
              maxWidth: string;
              mimeType: string;
              segmentAlignment: string;
              startWithSAP: string;
            };
            SegmentTemplate: ISegmentTemplate[];
            Representation: IVideoRepresentation[];
          },
          {
            $: {
              mimeType: string;
              segmentAlignment: string;
              startWithSAP: string;
            };
            SegmentTemplate: ISegmentTemplate[];
            Representation: [
              {
                $: {
                  audioSamplingRate: string;
                  bandwidth: string;
                  codecs: string;
                  id: string;
                };
                AudioChannelConfiguration: [
                  {
                    $: {
                      schemeIdUri: string;
                      value: string;
                    };
                  }
                ];
              }
            ];
          }
        ];
      }
    ];
  };
}
