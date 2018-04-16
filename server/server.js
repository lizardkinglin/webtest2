var express = require('express');
var bodyParser = require('body-parser');
var {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');

var Web3 = require("web3");
// 创建web3对象
var web3 = new Web3();
// 连接到以太坊节点
web3.setProvider(new Web3.providers.HttpProvider('http://etherfra6.southeastasia.cloudapp.azure.com:8545'));
var abi = [{"constant":false,"inputs":[{"name":"receiver","type":"address"},{"name":"amount","type":"uint256"}],"name":"sendCoin","outputs":[{"name":"sufficient","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"addr","type":"address"}],"name":"getBalance","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"inputs":[],"payable":false,"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Transfer","type":"event"}];
// 合约地址
var address = "0xd56ccba03e1147c5e499261979ac5a8c4280a85b";
// 通过ABI和地址获取已部署的合约对象
var metacoin = web3.eth.contract(abi).at(address);


var app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
  var todo = new Todo({
    text: req.body.text
  });

  todo.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

app.post('/todostest', (req, res) => {
  var todo = {
    text: req.body.text
  };

  console.log("%j", todo)
  

  try {
    var account_one = web3.eth.accounts[0];
    var account_two = web3.eth.accounts[1];
    
    var account_one_balance = metacoin.getBalance.call(account_one);
    console.log("account one balance:", account_one_balance.toNumber());
    //var coin = parseInt(todo.txet);
    //console.log("coin:", coin);
    var txhash = metacoin.sendCoin.sendTransaction(account_two, req.body.text, { from: account_one });
    
    var myEvent = metacoin.Transfer();
    myEvent.watch(function (err, result) {
        if (!err) {
            if (result.transactionHash == txhash) {
                var account_one_balance = metacoin.getBalance.call(account_one);
                var Num = {
                  num: account_one_balance.toNumber()
                }; 
                console.log("account one balance after sendCoin:", account_one_balance.toNumber());
                res.json(Num)
            }
        } else {
            console.log(err);
        }
        myEvent.stopWatching();
    });
  }
  catch (e) {
    res.status(400).send(e);
  }
});

app.get('/todos', (req, res) => {
  Todo.find().then((todos) => {
    res.send({todos});
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/todostest', (req, res) => {

  try {
    var account_one = web3.eth.accounts[0];
    var account_two = web3.eth.accounts[1];
    
    var account_one_balance = metacoin.getBalance.call(account_one);
    res.send(account_one_balance);
  }
  catch (e) {
    res.status(400).send(e);
  }
});

app.get('/todos/:id', (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findById(id).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }

    res.send({todo});
  }).catch((e) => {
    res.status(400).send();
  });
});

app.listen(port, () => {
  console.log(`Started up at port ${port}`);
});

module.exports = {app};
