var express = require('express');
var bodyParser = require('body-parser');
var {ObjectID} = require ('mongodb');
var {mongoose} = require('./db/mongoose');
var {Todo}= require('./models/todo');
var {User}= require('./models/user');

var app = express();

app.use(bodyParser.json());

app.post('/user', (req, res)=>{
    var user= new User({
        email: req.body.email
    });

    user.save().then((docs)=>{
       res.send(docs);
    }, (e)=>{
        res.status(400).send(e);
    });
});

app.get('/user', (req,res)=>{
    User.find().then((docs)=>{
        res.send({docs})
    },(e)=>{
        res.status(400).send(e);
    });
});

// GET id dari parameter
app.get('/user/:id',(req,res)=>{
    var id = req.params.id;
    //res.send(req.params); //artinya sistem merespon dengan paramater request

    //valid id using is valid
    if (!ObjectID.isValid(id)){
        return res.status(404).send();
    }
         //findbyid
        // console.log(id);
         
        User.findById(id).then((user)=>{
            if(!user){
              return res.status(404).send();
            }

            res.send({user})
        },(e)=>{
            res.status(400).send(e);
        });
    });



app.listen(3000, ()=>{
    console.log('Start on port 3000');
});

module.exports = {app};