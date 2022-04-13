# Flappy Learning ([Demo](http://xviniette.github.io/FlappyLearning/))

通过机器学习学习玩《Flappy Bird》的程序([Neuroevolution]
Program that learns to play Flappy Bird by machine learning ([Neuroevolution](http://www.scholarpedia.org/article/Neuroevolution))

![alt tag](https://github.com/xviniette/FlappyLearning/blob/gh-pages/img/flappy.png?raw=true)

### [NeuroEvolution.js](http://github.com/xviniette/FlappyLearning/blob/gh-pages/Neuroevolution.js) : Utilization
```javascript
//初始化Initialize
var ne = new Neuroevolution({options});

//默认的选项值Default options values
var options = {
    network:[1, [1], 1],    // 感知器结构Perceptron structure
    population:50,          // 人口的一代Population by generation
    elitism:0.2,            // 下一代最佳网络保持不变(费率)Best networks kepts unchanged for the next generation (rate)
    randomBehaviour:0.2,    // 下一代的新随机网络(速率)New random networks for the next generation (rate)
    mutationRate:0.1,       // 突触权值的突变率Mutation rate on the weights of synapses
    mutationRange:0.5,      // 突变间隔对突触权重的影响Interval of the mutation changes on the synapse weight
    historic:0,             // 最新一代保存Latest generations saved
    lowHistoric:false,      // 只保存分数(不是网络)Only save score (not the network)
    scoreSort:-1,           // 排序(-1 = desc, 1 = asc)Sort order (-1 = desc, 1 = asc)
    nbChild:1               // 生育的孩子数量number of child by breeding
}

//随时更新选项Update options at any time
ne.set({options});

//生成第一代或下一代Generate first or next generation
var generation = ne.nextGeneration();

//当一个网络超过>保存这个分数When an network is over -> save this score
ne.networkScore(generation[x], <score = 0>);
```

你可以在[Game.js](http://github.com/xviniette/FlappyLearning/blob/gh-pages/game.js)中看到《Flappy Bird》中的神经进化整合。
You can see the NeuroEvolution integration in Flappy Bird in [Game.js](http://github.com/xviniette/FlappyLearning/blob/gh-pages/game.js).
