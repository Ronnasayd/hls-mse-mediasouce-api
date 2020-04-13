ffmpeg -i a.mkv -vcodec libvpx -qmin 0 -qmax 50 -crf 10 -b:v 1M -acodec libvorbis a.webm



ffmpeg -i a.mkv -map 0:v -map 0:a -vcodec libvpx -qmin 0 -qmax 50 -crf 10 -b:v 1M -acodec libvorbis a.webm
