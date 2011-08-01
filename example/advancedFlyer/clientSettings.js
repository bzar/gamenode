// Assume localhost if no hostname
var hostname = location.hostname === "" ? "127.0.0.1" : location.hostname

var settings = {
    serverUrl: "ws://" + hostname + ":8888"
}
