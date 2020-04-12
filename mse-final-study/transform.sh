ffmpeg -i a.mp4 -vcodec libvpx -qmin 0 -qmax 50 -crf 10 -b:v 1M -acodec libvorbis a.webm
