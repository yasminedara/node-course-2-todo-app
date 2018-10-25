// ini server salah untuk todos
require ('./config/config');

const _=require ('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require ('mongodb');
const bcrypt = require ('bcryptjs');
var {mongoose} = require('./db/mongoose');
var {Todo}= require('./models/todo');
var {User}= require('./models/user');
var {authenticate}= require ('./middleware/authenticate')
var app = express();
const port = process.env.PORT; 

app.use(bodyParser.json());

app.post('/todos', authenticate, (req, res)=>{
    var todo= new Todo({
        text: req.body.text, // mengambil inputan text
        _creator : req.user._id 
    });

    todo.save().then((docs)=>{
       res.send(docs);
    }, (e)=>{
        res.status(400).send(e);
    });
});

app.get('/todos',authenticate, (req,res)=>{
    Todo.find({
        _creator:req.user._id
    }).then((todos)=>{
        res.send({todos})
    },(e)=>{
        res.status(400).send(e);
    });
});

// GET id dari parameter
app.get('/todos/:id',authenticate, (req,res)=>{
    var id = req.params.id;
    //res.send(req.params); //artinya sistem merespon dengan paramater request

    //valid id using is valid
    if (!ObjectID.isValid(id)){
        return res.status(404).send();
    }
         //findbyid
        Todo.findOne({
            _id : id,
            _creator: req.user._id
        }).then((todo)=>{
            if(!todo){
              return res.status(404).send();
            }

            res.send({todo})
        },(e)=>{
            res.status(400).send(e);
        });
    });

    app.delete('/todos/:id',authenticate, (req,res)=>{
        // get the id
        var id= req.params.id;

        //validate the id => not valid return 404
        if (!ObjectID.isValid(id)){
            return res.status(404).send();
        }

        //remove todo by id
        Todo.findOneAndRemove({
            _id:id,
            _creator : req.user._id
        }).then((todo)=>{
            //success
            if(todo){
                res.send({todo: todo});
             }
               //if no doc. send 404
            return res.status(404).send();
        },(e)=>{
            res.status(400).send(e);
        });
    });

    app.patch('/todos/:id',authenticate, (req, res) => {
        var id = req.params.id;
        var body = _.pick(req.body, ['text', 'completed']);
      
        if (!ObjectID.isValid(id)) {
          return res.status(404).send();
        }
      
        if (_.isBoolean(body.completed) && body.completed) {
          body.completedAt = new Date().getTime();
        } else {
          body.completed = false;
          body.completedAt = null;
        }
      
        //finOneandUpdate
        Todo.findOneAndUpdate({_id: id,_creator : req.user._id } ,{$set: body}, {new: true}).then((todo) => {
          if (!todo) {
            return res.status(404).send();
          }
      
          res.send({todo});
        }).catch((e) => {
          res.status(400).send();
        })
      });
      

    app.post('/user', (req, res)=>{
        var user= new User({
            email: req.body.email,
            password : req.body.password
    
        });
    
        user.save().then((docs)=>{
           res.send(docs);
        }, (e)=>{
            res.status(400).send(e);
        });
    });

    
    app.post('/users', (req, res) => {
        var body = _.pick(req.body, ['email', 'password']);
        var user = new User(body);
      
        user.save().then(() => {
          return user.generateAuthToken();
        }).then((token) => {
          res.header('x-auth', token).send(user);
        }).catch((e) => {
          res.status(400).send(e);
        })
      });

 //private route
app.get('/users/me', authenticate, (req,res)=>{
  res.send(req.user)
});


//post /user/login {email, password}
app.post('/users/login',(req, res)=>{
    var body = _.pick(req.body, ['email', 'password']);
    
    User.finByCredentials(body.email,body.password). then((user)=>{
       return user.generateAuthToken().then((token)=>{
        res.header('x-auth', token).send(user);
        })
    }).catch((e)=>{
        res.status(400).send();
    })
    
})

app.delete('/users/me/token', authenticate,(req,res) =>{
    req.user.removeToken(req.token).then(()=>{
        res.status(200).send();
    },()=>{
        res.status(400).send()
    });
});
app.listen(port, ()=>{
    console.log(`Started up at port ${port}`);
});

module.exports = {app};