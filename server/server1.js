var env = process.env.NODE_ENV || 'development';
console.log('env *****',env);


if (env === 'development'){
    process.env.PORT=3000;
    process.env.MONGODB_URI='mongodb://localhost:27017/TodoApp';
} else if (env === 'test'){
    process.env.PORT =3000;
    process.env.MONGODB_URI='mongodb://localhost:27017/TodoApp';
}

const _=require ('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require ('mongodb');

var {mongoose} = require('./db/mongoose');
var {Todo}= require('./models/todo');
var {User}= require('./models/user');

var app = express();
const port = process.env.PORT; 

app.use(bodyParser.json());

app.post('/todos', (req, res)=>{
    var todo= new Todo({
        text: req.body.text // mengambil inputan ttext
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

    app.patch('/todos/:id' ,(req, res) => {
        var id= req.params.id;
        var body = _.pick(req.body, ['text','completed']); // mengambil inputan text dan completed
        console.log(body);
        

        if (!ObjectID.isValid(id)){
            return res.status(404).send();
        }
         console.log(_.isBoolean(body.completed));
         console.log(body.completed);
         
        if (_.isBoolean(body.completed) && body.completed){ // jika true && true
            body.completedAt= new Date().getTime();
        }else{
            body.completed=false;
            body.completedAt=null;
        }
        
        Todo.findByIdAndUpdate(id, {$set : body}, {new : true}).then((done)=>{
            
            if(!done){
                return res.status(404).send();
            }

            res.send({done});
        }).catch((e)=>{
            res.status(400).send();
        })

    });
    


app.listen(port, ()=>{
    console.log(`Started up at port ${port}`);
});

module.exports = {app};