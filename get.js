function GET(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.send();

    xhr.onload = function (e) {
        if (xhr.status != 200) {
            return false;
        }
        callback(xhr.response);
    };
}
self.addEventListener('message', function (e) {
    GET(e.data, function (data) {
        // console.log(data)
        self.postMessage({ 'array': data })
    })
})