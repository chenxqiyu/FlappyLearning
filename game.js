//https://chenxqiyu.github.io/FlappyLearning/
(function () {
	var timeouts = [];
	var messageName = "zero-timeout-message";

	function setZeroTimeout(fn) {
		timeouts.push(fn);
		window.postMessage(messageName, "*");
	}

	function handleMessage(event) {
		if (event.source == window && event.data == messageName) {
			event.stopPropagation();
			if (timeouts.length > 0) {
				var fn = timeouts.shift();
				fn();
			}
		}
	}

	window.addEventListener("message", handleMessage, true);

	window.setZeroTimeout = setZeroTimeout;
})();

//神经网络-声明
var Neuvol;
var game;
var FPS = 60;
var maxScore = 0;

var images = {};
//速度类
var speed = function (fps) {
	FPS = parseInt(fps);
}
//加载类
var loadImages = function (sources, callback) {
	var nb = 0;
	var loaded = 0;
	var imgs = {};
	for (var i in sources) {
		nb++;
		imgs[i] = new Image();
		imgs[i].src = sources[i];
		imgs[i].onload = function () {
			loaded++;
			if (loaded == nb) {
				callback(imgs);
			}
		}
	}
}
//鸟类
class Bird {
	constructor(json) {
		this.x = 80;
		this.y = 250;
		this.width = 40;
		this.height = 30;

		this.alive = true;
		this.gravity = 0;
		this.velocity = 0.3;
		this.jump = -6;

		this.init(json);
	}
	init(json) {
		for (var i in json) {
			this[i] = json[i];
		}
	}
	flap() {
		this.gravity = this.jump;
	}
	update() {
		this.gravity += this.velocity;
		this.y += this.gravity;
	}
	isDead(height, pipes) {
		if (this.y >= height || this.y + this.height <= 0) {
			return true;
		}
		for (var i in pipes) {
			if (!(
				this.x > pipes[i].x + pipes[i].width ||
				this.x + this.width < pipes[i].x ||
				this.y > pipes[i].y + pipes[i].height ||
				this.y + this.height < pipes[i].y
			)) {
				return true;
			}
		}
	}
}


//管道类
class Pipe {
	constructor(json) {
		this.x = 0;
		this.y = 0;
		this.width = 50;
		this.height = 40;
		this.speed = 3;

		this.init(json);
	}
	init(json) {
		for (var i in json) {
			this[i] = json[i];
		}
	}
	update() {
		this.x -= this.speed;
	}
	isOut() {
		if (this.x + this.width < 0) {
			return true;
		}
	}
}




//游戏类
class Game {
	constructor() {
		/** 管道数组 */
		this.pipes = [];
		/** 鸟数组 */
		this.birds = [];
		/**分数 */
		this.score = 0;
		/**画布节点 */
		this.canvas = document.querySelector("#flappy");
		/**画布对象 */
		this.ctx = this.canvas.getContext("2d");
		/**宽度 */
		this.width = this.canvas.width;
		/**高度 */
		this.height = this.canvas.height;
		/**产卵时间间隔 */
		this.spawnInterval = 90;
		/**间隔 */
		this.interval = 0;
		/**下一代数组 */
		this.gen = [];
		/**鸟的存活数量 */
		this.alives = 0;
		/**代数统计 */
		this.generation = 0;
		/**背景移动速度 */
		this.backgroundSpeed = 0.5;
		this.backgroundx = 0;
		/**最大分数 */
		this.maxScore = 0;
	}
	start() {
		this.interval = 0;
		this.score = 0;
		this.pipes = [];
		this.birds = [];

		//神经网络-下一代
		this.gen = Neuvol.nextGeneration();

		for (var i in this.gen) {
			var b = new Bird();
			this.birds.push(b)
		}
		this.generation++;
		this.alives = this.birds.length;
	}
	update() {
		//移动背景
		this.backgroundx += this.backgroundSpeed;
		/**下一个霍尔 */
		var nextHoll = 0;

		//如果鸟的数量大于0
		if (this.birds.length > 0) {
			//遍历管道数组
			for (var i = 0; i < this.pipes.length; i += 2) {
				//如果鸟在一个管道的左边
				if (this.pipes[i].x + this.pipes[i].width > this.birds[0].x) {
					nextHoll = this.pipes[i].height / this.height;
					break;
				}
			}
		}

		//遍历鸟数组
		for (var i in this.birds) {
			//如果该鸟还活着
			if (this.birds[i].alive) {

				//初始化输入值
				var inputs = [
					this.birds[i].y / this.height,
					nextHoll
				];
				//神经计算输入
				var res = this.gen[i].compute(inputs);
				//神经计算输出
				if (res > 0.5) {
					this.birds[i].flap();
				}
				//鸟更新
				this.birds[i].update();
				//如果鸟碰撞管道
				if (this.birds[i].isDead(this.height, this.pipes)) {
					this.birds[i].alive = false;
					this.alives--;
					//console.log(this.alives);
					//神经网络-得分
					Neuvol.networkScore(this.gen[i], this.score);
					//鸟数量为0重置游戏
					if (this.isItEnd()) {
						this.start();
					}
				}
			}
		}

		for (var i = 0; i < this.pipes.length; i++) {
			this.pipes[i].update();
			if (this.pipes[i].isOut()) {
				this.pipes.splice(i, 1);
				i--;
			}
		}

		if (this.interval == 0) {
			var deltaBord = 50;
			var pipeHoll = 120;
			var hollPosition = Math.round(Math.random() * (this.height - deltaBord * 2 - pipeHoll)) + deltaBord;
			this.pipes.push(new Pipe({ x: this.width, y: 0, height: hollPosition }));
			this.pipes.push(new Pipe({ x: this.width, y: hollPosition + pipeHoll, height: this.height }));
		}

		this.interval++;
		if (this.interval == this.spawnInterval) {
			this.interval = 0;
		}

		this.score++;
		this.maxScore = (this.score > this.maxScore) ? this.score : this.maxScore;
		var self = this;

		if (FPS == 0) {
			setZeroTimeout(function () {
				self.update();
			});
		} else {
			setTimeout(function () {
				self.update();
			}, 1000 / FPS);
		}
	}
	isItEnd() {
		for (var i in this.birds) {
			if (this.birds[i].alive) {
				return false;
			}
		}
		return true;
	}
	display() {
		this.ctx.clearRect(0, 0, this.width, this.height);
		for (var i = 0; i < Math.ceil(this.width / images.background.width) + 1; i++) {
			this.ctx.drawImage(images.background, i * images.background.width - Math.floor(this.backgroundx % images.background.width), 0)
		}

		for (var i in this.pipes) {
			if (i % 2 == 0) {
				this.ctx.drawImage(images.pipetop, this.pipes[i].x, this.pipes[i].y + this.pipes[i].height - images.pipetop.height, this.pipes[i].width, images.pipetop.height);
			} else {
				this.ctx.drawImage(images.pipebottom, this.pipes[i].x, this.pipes[i].y, this.pipes[i].width, images.pipetop.height);
			}
		}

		this.ctx.fillStyle = "#FFC600";
		this.ctx.strokeStyle = "#CE9E00";
		for (var i in this.birds) {
			if (this.birds[i].alive) {
				this.ctx.save();
				this.ctx.translate(this.birds[i].x + this.birds[i].width / 2, this.birds[i].y + this.birds[i].height / 2);
				this.ctx.rotate(Math.PI / 2 * this.birds[i].gravity / 20);
				this.ctx.drawImage(images.bird, -this.birds[i].width / 2, -this.birds[i].height / 2, this.birds[i].width, this.birds[i].height);
				this.ctx.restore();
			}
		}

		this.ctx.fillStyle = "white";
		this.ctx.font = "20px Oswald, sans-serif";
		this.ctx.fillText("得分 : " + this.score, 10, 25);
		this.ctx.fillText("最高分数 : " + this.maxScore, 10, 50);
		this.ctx.fillText("代数 : " + this.generation, 10, 75);
		//神经网络-显示神经网络人口
		this.ctx.fillText("存活数 : " + this.alives + " / " + Neuvol.options.population, 10, 100);

		var self = this;
		requestAnimationFrame(function () {
			self.display();
		});
	}
}





window.onload = function () {
	var sprites = {
		bird: "./img/bird.png",
		background: "./img/background.png",
		pipetop: "./img/pipetop.png",
		pipebottom: "./img/pipebottom.png"
	}

	var start = function () {
		//神经网络-创建神经网络
		Neuvol = new Neuroevolution({
			population: 50,
			network: [2, [2], 1],
		});
		game = new Game();
		game.start();
		game.update();
		game.display();
	}


	loadImages(sprites, function (imgs) {
		images = imgs;
		start();
	})

}
//https://chenxqiyu.github.io/FlappyLearning/