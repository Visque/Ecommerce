const mongoose = require("mongoose");

const url = "mongodb+srv://visque:root@cluster0.ygfy8.mongodb.net/ecommerce-test?retryWrites=true&w=majority"

module.exports.start = function(){
    mongoose.connect(url).then(function(){
        console.log(`DB connected`)
    })
    .catch(function(err){
        console.log(`DB not connected: `, err)
    })
}