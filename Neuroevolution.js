/**
 * 提供一组类和方法来处理神经进化和遗传算法
 * Provides a set of classes and methods for handling Neuroevolution and
 * genetic algorithms.
 *
 * @param {options} An object of options for Neuroevolution.
 */
var Neuroevolution = function (options) {
	var self = this; //参考此模块的顶部作用域reference to the top scope of this module

	// 模块参数(选项)和默认值的声明Declaration of module parameters (options) and default values
	self.options = {
		/**
		 * 物流的激活函数Logistic activation function.
		 *
		 * @param {a} Input value.
		 * @return 逻辑函数的输出Logistic function output.
		 */
		activation: function (a) {
			ap = (-a) / 1;
			return (1 / (1 + Math.exp(ap)))
		},

		/**
		 * 返回-1到1之间的随机值Returns a random value between -1 and 1.
		 *
		 * @return 随机值Random value.
		 */
		randomClamped: function () {
			return Math.random() * 2 - 1;
		},

		//各种因素和参数(以及默认值)。 various factors and parameters (along with default values).
		network: [1, [1], 1], // Perceptron network structure (1 hidden
		// layer).
		population: 50, //人口的一代 Population by generation.
		elitism: 0.2, //最好的网络保持不变 Best networks kepts unchanged for the next
		// generation (rate).
		randomBehaviour: 0.2, //下一代新的随机网络 New random networks for the next generation
		// (rate).
		mutationRate: 0.1, //突触权值的突变率。 Mutation rate on the weights of synapses.
		mutationRange: 0.5, //突变的间隔在突触的重量 Interval of the mutation changes on the
		// synapse weight.
		historic: 0, //最新一代保存 Latest generations saved.
		lowHistoric: false, //只保存分数(不是网络) Only save score (not the network).
		scoreSort: -1, //排序 Sort order (-1 = desc, 1 = asc).
		nbChild: 1 //生育的孩子数量。 Number of children by breeding.

	}

	/**
	 * 覆盖默认选项Override default options.
	 *
	 * @param {options} 是神经进化选择的对象An object of Neuroevolution options.
	 * @return void
	 */
	self.set = function (options) {
		for (var i in options) {
			if (this.options[i] != undefined) { //只有在传入值时才重写是实际定义的。 Only override if the passed in value
				// is actually defined.
				self.options[i] = options[i];
			}
		}
	}

	//用传入选项覆盖默认选项 Overriding default options with the pass in options
	self.set(options);


	/*NEURON**********************************************************************/
	/**
	 * 人工神经元类Artificial Neuron class
	 *
	 * @constructor
	 */
	var Neuron = function () {
		this.value = 0;
		this.weights = [];
	}

	/**
	 * 将神经元权值的数目初始化为随机箝位值。Initialize number of neuron weights to random clamped values.
	 *
	 * @param {nb} 神经元权重数(输入数)Number of neuron weights (number of inputs).
	 * @return void
	 */
	Neuron.prototype.populate = function (nb) {
		this.weights = [];
		for (var i = 0; i < nb; i++) {
			this.weights.push(self.options.randomClamped());
		}
	}


	/*LAYER***********************************************************************/
	/**
	 * 神经网络层类Neural Network Layer class.
	 *
	 * @constructor
	 * @param {index} 该层在网络中的索引。Index of this Layer in the Network.
	 */
	var Layer = function (index) {
		this.id = index || 0;
		this.neurons = [];
	}

	/**
	 * 用一组随机加权的神经元填充层Populate the Layer with a set of randomly weighted Neurons.
	 *
	 * 每个神经元都用nbInputs输入进行初始化，并随机箝位值Each Neuron be initialied with nbInputs inputs with a random clamped
	 * value.
	 *
	 * @param {nbNeurons} Number of neurons.
	 * @param {nbInputs} Number of inputs.
	 * @return void
	 */
	Layer.prototype.populate = function (nbNeurons, nbInputs) {
		this.neurons = [];
		for (var i = 0; i < nbNeurons; i++) {
			var n = new Neuron();
			n.populate(nbInputs);
			this.neurons.push(n);
		}
	}


	/*NEURAL NETWORK**************************************************************/
	/**
	 * 多类神经网络机Neural Network class
	 *
	 * 由神经元层组成Composed of Neuron Layers.
	 *
	 * @constructor
	 */
	var Network = function () {
		this.layers = [];
	}

	/**
	 * 生成网络层Generate the Network layers.
	 *
	 * @param {input} Number of Neurons in Input layer.
	 * @param {hidden} Number of Neurons per Hidden layer.
	 * @param {output} Number of Neurons in Output layer.
	 * @return void
	 */
	Network.prototype.perceptronGeneration = function (input, hiddens, output) {
		var index = 0;
		var previousNeurons = 0;
		var layer = new Layer(index);
		layer.populate(input, previousNeurons); //输入的数量将被设置为0，因为它是一个输入层。 Number of Inputs will be set to 0 since it is an input layer.
		previousNeurons = input; //输入的数量是前一层的大小。 number of input is size of previous layer.
		this.layers.push(layer);
		index++;
		for (var i in hiddens) {
			//对每个隐藏层重复第一层相同的过程。 Repeat same process as first layer for each hidden layer.
			var layer = new Layer(index);
			layer.populate(hiddens[i], previousNeurons);
			previousNeurons = hiddens[i];
			this.layers.push(layer);
			index++;
		}
		var layer = new Layer(index);
		layer.populate(output, previousNeurons); //输入的数量等于最后一个隐藏层的大小 Number of input is equal to the size of the last hidden layer.
		this.layers.push(layer);
	}

	/**
	 * 创建网络的副本(神经元和权重)Create a copy of the Network (neurons and weights).
	 *
	 * 返回每层神经元的数量和所有权重的平面数组。Returns number of neurons per layer and a flat array of all weights.
	 *
	 * @return 网络数据Network data.
	 */
	Network.prototype.getSave = function () {
		var datas = {
			neurons: [], //每层神经元的数目 Number of Neurons per layer.
			weights: [] //每个神经元输入的权重 Weights of each Neuron's inputs.
		};

		for (var i in this.layers) {
			datas.neurons.push(this.layers[i].neurons.length);
			for (var j in this.layers[i].neurons) {
				for (var k in this.layers[i].neurons[j].weights) {
					//将每一层每个神经元的所有输入权重推入一个平面阵列。 push all input weights of each Neuron of each Layer into a flat array.
					datas.weights.push(this.layers[i].neurons[j].weights[k]);
				}
			}
		}
		return datas;
	}

	/**
	 * 应用网络数据(神经元和权重)。Apply network data (neurons and weights).
	 *
	 * @param {save} 网络数据的拷贝(神经元和权重)Copy of network data (neurons and weights).
	 * @return void
	 */
	Network.prototype.setSave = function (save) {
		var previousNeurons = 0;
		var index = 0;
		var indexWeights = 0;
		this.layers = [];
		for (var i in save.neurons) {
			//创建和填充层。 Create and populate layers.
			var layer = new Layer(index);
			layer.populate(save.neurons[i], previousNeurons);
			for (var j in layer.neurons) {
				for (var k in layer.neurons[j].weights) {
					//对每个Neuron应用神经元权重。 Apply neurons weights to each Neuron.
					layer.neurons[j].weights[k] = save.weights[indexWeights];

					indexWeights++; //平面数组的增量索引 Increment index of flat array.
				}
			}
			previousNeurons = save.neurons[i];
			index++;
			this.layers.push(layer);
		}
	}

	/**
	 * 计算输入的输出。Compute the output of an input.
	 *
	 * @param {inputs} 组输入Set of inputs.
	 * @return 网络输出Network output.
	 */
	Network.prototype.compute = function (inputs) {
		//设置输入层中每个神经元的值 Set the value of each Neuron in the input layer.
		for (var i in inputs) {
			if (this.layers[0] && this.layers[0].neurons[i]) {
				this.layers[0].neurons[i].value = inputs[i];
			}
		}

		var prevLayer = this.layers[0]; //上一层是输入层。 Previous layer is input layer.
		for (var i = 1; i < this.layers.length; i++) {
			for (var j in this.layers[i].neurons) {
				//对于每一层中的每一个神经元 For each Neuron in each layer.
				var sum = 0;
				for (var k in prevLayer.neurons) {
					//上一层的每个神经元都是下一层每个神经元的输入 Every Neuron in the previous layer is an input to each Neuron in the next layer.
					sum += prevLayer.neurons[k].value *
						this.layers[i].neurons[j].weights[k];
				}

				//计算神经元的激活。 Compute the activation of the Neuron.
				this.layers[i].neurons[j].value = self.options.activation(sum);
			}
			prevLayer = this.layers[i];
		}

		//网络的所有输出。 All outputs of the Network.
		var out = [];
		var lastLayer = this.layers[this.layers.length - 1];
		for (var i in lastLayer.neurons) {
			out.push(lastLayer.neurons[i].value);
		}
		return out;
	}


	/*GENOME**********************************************************************/
	/**
	 * Genome class.
	 *
	 * Composed of a score and a Neural Network.
	 *
	 * @constructor
	 *
	 * @param {score}
	 * @param {network}
	 */
	var Genome = function (score, network) {
		this.score = score || 0;
		this.network = network || null;
	}


	/*GENERATION******************************************************************/
	/**
	 * Generation class.
	 *
	 * Composed of a set of Genomes.
	 *
	 * @constructor
	 */
	var Generation = function () {
		this.genomes = [];
	}

	/**
	 * Add a genome to the generation.
	 *
	 * @param {genome} Genome to add.
	 * @return void.
	 */
	Generation.prototype.addGenome = function (genome) {
		// Locate position to insert Genome into.
		// The gnomes should remain sorted.
		for (var i = 0; i < this.genomes.length; i++) {
			// Sort in descending order.
			if (self.options.scoreSort < 0) {
				if (genome.score > this.genomes[i].score) {
					break;
				}
				// Sort in ascending order.
			} else {
				if (genome.score < this.genomes[i].score) {
					break;
				}
			}

		}

		// Insert genome into correct position.
		this.genomes.splice(i, 0, genome);
	}

	/**
	 * Breed to genomes to produce offspring(s).
	 *
	 * @param {g1} Genome 1.
	 * @param {g2} Genome 2.
	 * @param {nbChilds} Number of offspring (children).
	 */
	Generation.prototype.breed = function (g1, g2, nbChilds) {
		var datas = [];
		for (var nb = 0; nb < nbChilds; nb++) {
			// Deep clone of genome 1.
			var data = JSON.parse(JSON.stringify(g1));
			for (var i in g2.network.weights) {
				// Genetic crossover
				// 0.5 is the crossover factor.
				// FIXME Really should be a predefined constant.
				if (Math.random() <= 0.5) {
					data.network.weights[i] = g2.network.weights[i];
				}
			}

			// Perform mutation on some weights.
			for (var i in data.network.weights) {
				if (Math.random() <= self.options.mutationRate) {
					data.network.weights[i] += Math.random() *
						self.options.mutationRange *
						2 -
						self.options.mutationRange;
				}
			}
			datas.push(data);
		}

		return datas;
	}

	/**
	 * Generate the next generation.
	 *
	 * @return Next generation data array.
	 */
	Generation.prototype.generateNextGeneration = function () {
		var nexts = [];

		for (var i = 0; i < Math.round(self.options.elitism *
				self.options.population); i++) {
			if (nexts.length < self.options.population) {
				// Push a deep copy of ith Genome's Nethwork.
				nexts.push(JSON.parse(JSON.stringify(this.genomes[i].network)));
			}
		}

		for (var i = 0; i < Math.round(self.options.randomBehaviour *
				self.options.population); i++) {
			var n = JSON.parse(JSON.stringify(this.genomes[0].network));
			for (var k in n.weights) {
				n.weights[k] = self.options.randomClamped();
			}
			if (nexts.length < self.options.population) {
				nexts.push(n);
			}
		}

		var max = 0;
		while (true) {
			for (var i = 0; i < max; i++) {
				// Create the children and push them to the nexts array.
				var childs = this.breed(this.genomes[i], this.genomes[max],
					(self.options.nbChild > 0 ? self.options.nbChild : 1));
				for (var c in childs) {
					nexts.push(childs[c].network);
					if (nexts.length >= self.options.population) {
						// Return once number of children is equal to the
						// population by generatino value.
						return nexts;
					}
				}
			}
			max++;
			if (max >= this.genomes.length - 1) {
				max = 0;
			}
		}
	}


	/*GENERATIONS*****************************************************************/
	/**
	 * Generations class.
	 *
	 * Hold's previous Generations and current Generation.
	 *
	 * @constructor
	 */
	var Generations = function () {
		this.generations = [];
		var currentGeneration = new Generation();
	}

	/**
	 * Create the first generation.
	 *
	 * @param {input} Input layer.
	 * @param {input} Hidden layer(s).
	 * @param {output} Output layer.
	 * @return First Generation.
	 */
	Generations.prototype.firstGeneration = function (input, hiddens, output) {
		// FIXME input, hiddens, output unused.

		var out = [];
		for (var i = 0; i < self.options.population; i++) {
			// Generate the Network and save it.
			var nn = new Network();
			nn.perceptronGeneration(self.options.network[0],
				self.options.network[1],
				self.options.network[2]);
			out.push(nn.getSave());
		}

		this.generations.push(new Generation());
		return out;
	}

	/**
	 * Create the next Generation.
	 *
	 * @return Next Generation.
	 */
	Generations.prototype.nextGeneration = function () {
		if (this.generations.length == 0) {
			// Need to create first generation.
			return false;
		}

		var gen = this.generations[this.generations.length - 1]
			.generateNextGeneration();
		this.generations.push(new Generation());
		return gen;
	}

	/**
	 * Add a genome to the Generations.
	 *
	 * @param {genome}
	 * @return False if no Generations to add to.
	 */
	Generations.prototype.addGenome = function (genome) {
		// Can't add to a Generation if there are no Generations.
		if (this.generations.length == 0) return false;

		// FIXME addGenome returns void.
		return this.generations[this.generations.length - 1].addGenome(genome);
	}


	/*SELF************************************************************************/
	self.generations = new Generations();

	/**
	 * Reset and create a new Generations object.
	 *
	 * @return void.
	 */
	self.restart = function () {
		self.generations = new Generations();
	}

	/**
	 * Create the next generation.
	 *
	 * @return Neural Network array for next Generation.
	 */
	self.nextGeneration = function () {
		var networks = [];

		if (self.generations.generations.length == 0) {
			// If no Generations, create first.
			networks = self.generations.firstGeneration();
		} else {
			// Otherwise, create next one.
			networks = self.generations.nextGeneration();
		}

		// Create Networks from the current Generation.
		var nns = [];
		for (var i in networks) {
			var nn = new Network();
			nn.setSave(networks[i]);
			nns.push(nn);
		}

		if (self.options.lowHistoric) {
			// Remove old Networks.
			if (self.generations.generations.length >= 2) {
				var genomes =
					self.generations
					.generations[self.generations.generations.length - 2]
					.genomes;
				for (var i in genomes) {
					delete genomes[i].network;
				}
			}
		}

		if (self.options.historic != -1) {
			// Remove older generations.
			if (self.generations.generations.length > self.options.historic + 1) {
				self.generations.generations.splice(0,
					self.generations.generations.length - (self.options.historic + 1));
			}
		}

		return nns;
	}

	/**
	 * Adds a new Genome with specified Neural Network and score.
	 *
	 * @param {network} Neural Network.
	 * @param {score} Score value.
	 * @return void.
	 */
	self.networkScore = function (network, score) {
		self.generations.addGenome(new Genome(score, network.getSave()));
	}
}
