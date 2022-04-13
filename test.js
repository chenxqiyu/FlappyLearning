window.onload = function () {

    var c = new client()
    c.start()


}

var client = () => {
    this.x = 0
    this.y = 0

}
client.prototype.start = () => {
    console.log("start")
}