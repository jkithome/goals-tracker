require('dotenv').config();
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var path = require('path');
var app = express();
mongoose.connect(process.env.DATABASE_URL);
var Goal = require('./models/goal');
var Pusher = require('pusher');

var pusher = new Pusher({
  appId: process.env.APP_ID,
  key: process.env.KEY,
  secret: process.env.SECRET,
  cluster: process.env.CLUSTER,
  encrypted: true
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/api/goals', function(err,res) {
  Goal.find({}, function(err,goals) {
    if(err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(goals)
    }
  })
});

app.post('/api/goal', function(req,res) {
  var goal = new Goal();
  goal.title = req.body.title;
  goal.description = req.body.description;
  goal.email = req.body.email
  if(req.body.priority) {
    goal.priority = Number(req.body.priority);
  }
  goal.save(function(err, goal) {
    if(err) {
      res.status(500).send(err)
    } else {
      res.status(200).send(goal)
      pusher.trigger('goals', 'new', goal)
    }
  })

});

app.put('/api/goal/:id', function(req,res) {
  Goal.findById(req.params.id, function(err, goal) {
    if (err) {
      res.status(500).send(err)
    } else {
      if (req.body.priority) {
        goal.priority = Number(req.body.priority);
      }
      goal.save(function(err,goal) {
        if(err) {
          res.status(500).send(err);
        } else {
          res.status(200).send(goal);
          pusher.trigger('goals', 'update', goal);
        }
      })
    }
  })
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', function(req,res) {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.listen(3000);

console.log('App is listening on port 3000');

module.exports = app;

