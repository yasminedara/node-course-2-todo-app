var mongoose = require('mongoose');

var User= mongoose.model('User',{
    email: {
        type : String,
        required : true,
        minlength: 1,
        trim: true // untuk menghilangkan spasi depan atau belakang
    }
});

module.exports ={User}