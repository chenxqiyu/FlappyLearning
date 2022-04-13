

var client = function () {
    this.x = 0
    this.y = 0

}
client.prototype.start = function () {
    this.x = 123
    this.y = 456
    console.log("start")
}

class client2 {
    constructor() {
        this.xx = 213
        this.yy = 456
    }
    start() {
        console.log("start2")
    }
}

window.onload = function () {

    var c = new client()
    c.start()
    var c2=new client2()
    c2.start()

}