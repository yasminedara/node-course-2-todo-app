var express = require('express');
var bodyParser = require('body-parser');
var {ObjectID} = require ('mongodb');
var {mongoose} = require('./db/mongoose');
var {Todo}= require('./models/todo');
var {User}= require('./models/user');

var app = express();
const port = process.env.PORT || 3000; 

app.use(bodyParser.json());

app.post('/todos', (req, res)=>{
    var todo= new Todo({
        text: req.body.text
    });

    todo.save().then((docs)=>{
       res.send(docs);
    }, (e)=>{
        res.status(400).send(e);
    });
});

app.get('/todos', (req,res)=>{
    Todo.find().then((todos)=>{
        res.send({todos})
    },(e)=>{
        res.status(400).send(e);
    });
});

// GET id dari parameter
app.get('/todos/:id',(req,res)=>{
    var id = req.params.id;
    //res.send(req.params); //artinya sistem merespon dengan paramater request

    //valid id using is valid
    if (!ObjectID.isValid(id)){
        return res.status(404).send();
    }
         //findbyid
        Todo.findById(id).then((todo)=>{
            if(!todo){
              return res.status(404).send();
            }

            res.send({todo})
        },(e)=>{
            res.status(400).send(e);
        });
    });

    app.delete('/todos/:id',(req,res)=>{
        // get the id
        var id= req.params.id;

        //validate the id => not valid return 404
        if (!ObjectID.isValid(id)){
            return res.status(404).send();
        }

        //remove todo by id
        Todo.findByIdAndRemove(id).then((todo)=>{
            //success
            if(todo){
                res.send({todo: todo});
             }
               //if no doc. send 404
            return res.status(404).send();
        },(e)=>{
            res.status(400).send(e);
        });
            
              
                // if doc, send doc back with 200
            //error
                //404 with empty od\\body
    });


app.listen(port, ()=>{
    console.log(`Started up at port ${port}`);
});

module.exports = {app};