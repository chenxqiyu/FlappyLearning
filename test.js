class client {
    constructor(no) {
        this.no = no
        this.x = 0
        this.y = 0
        this.alive = true

    }
    change(move) {
        this.y += move;
    }
    update() {
        if (this.y > window.outerHeight) { this.y = 0; } else { this.y++ }

    }

}

var me = []
var gen = []
//神经网络-创建神经网络
var ne = new Neuroevolution({
    population: 50,// 代数
    network: [2, [2], 1],// 感知器结构
});
function start() {

    me = []
    //开始生成
    gen = ne.nextGeneration();
    console.log(gen);

    for (var i = 0; i < gen.length; i++) {
        me.push(new client(i))
    }
    console.log(me)

}
window.onload = function () {


    start()

    setInterval(function () {
        var nextHoll = 0;

        nextHoll++

        for (var i in me) {
            if (me[i].alive) {

                //输入
                var inputs =
                    [
                        me[i].y,
                        nextHoll
                    ];

                var res = gen[i].compute(inputs);
                if (res > 0.5) {
                    me[i].change(Math.round(Math.random() * window.outerHeight))
                }


                //输出

                //得分
                if (me[i].y > window.outerHeight) {
                    me[i].alive = false
                    ne.networkScore(this.gen[i], this.score);
                    var isall = true;
                    for (var id in me) {
                        if (me[id].alive) {
                            isall = false
                            return false
                        }
                    }
                    if (isall) {
                        start()
                    }
                }
                //重启
                console.log(me[i].no);
            }
        }
    }, 1000)
    setInterval(function () {
        document.body.innerHTML = ""
        for (var i in me) {
            if (me[i].alive) {
                document.write(me[i].no + ",")
            }
        }
        document.write("<br>")
        for (var i in me) {
            if (!me[i].alive) {
                document.write(me[i].no + ",")
            }
        }
    }, 1000)


    //输入
    //输出
    //>0.5移动

    //满足条件得分
    //  networkScore(this.gen[i], this.score);

    //如果对象组为0重置


}