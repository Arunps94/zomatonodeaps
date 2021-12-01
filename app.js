var express = require('express');

var app = express();
var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var dotenv = require('dotenv');


dotenv.config();
// var mongoLocalUrl = process.env.MongoLocalUrl;
var mongoLiveUrl = "mongodb+srv://aps_database:arunps94@cluster0.iq5mg.mongodb.net/Zenkart?retryWrites=true&w=majority"
var cors = require("cors")
var port = process.env.PORT || 8124;
const bodyParser = require('body-parser');
//save the database connection
var db 

app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json());
app.use(cors());

app.get('/',(req, res) => {res.send("Hii from Express")})

app.get('/location',(req, res) => {
   db.collection('location').find().toArray((err,result) =>{
       if(err) throw err;
       res.send(result);
   })
})
// return all the mealType
app.get('/mealType',(req,res) => {
    db.collection('MealTypes').find().toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
})

// // return all the restaurants
// app.get('/restaurants',(req,res) => {
//     db.collection('RestaurantsData').find().toArray((err,result) => {
//         if(err) throw err;
//         res.send(result)
//     })
// })

// restaurant wrt to id
app.get('/restaurants/:id',(req,res) => {
    var id = parseInt(req.params.id);
    db.collection('RestaurantsData').find({"restaurant_id":id}).toArray((err,result) =>{
        if(err) throw err;
        res.send(result) 
    })
})

// query params examples
///wrt to city_name
app.get('/restaurants',(req,res) => {
    var query = {};
    console.log(req.query.city)
    if(req.query.state_id){
        query={state_id:Number(req.query.city)}
    }
    db.collection('RestaurantsData').find(query).toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
})


// restaurant wrt to mealid
app.get('/filter/:mealId',(req,res) => {
    var id = parseInt(req.params.mealId);
    var sort ={cost:1}
    var query = {"mealTypes.mealtype_id":id}
    if(req.query.sortKey){
        var sortKey = req.query.sortKey
        if(sortKey>1 || sortKey<-1 || sortKey==0){
            sortKey=1
        }
        sort = {cost: Number(sortKey)}
    }
    if(req.query.lcost && req.query.hcost){
        var lcost = Number(req.query.lcost);
        var hcost = Number(req.query.hcost);}
   if(req.query.cuisine&&req.query.lcost && req.query.hcost){
    query = {$and:[{cost:{$gt:lcost,$lt:hcost}}],"cuisines.cuisine_id":Number(req.query.cuisine),"mealTypes.mealtype_id":id}
   }
   else if(req.query.cuisine){
        query = {"mealTypes.mealtype_id":id,"cuisines.cuisine_id":Number(req.query.cuisine)}
        // query = {"mealTypes.mealtype_id":id,"cuisines.cuisine_id":{$in:[2,5]}}
    }else if(req.query.lcost && req.query.hcost){
        query = {$and:[{cost:{$gt:lcost,$lt:hcost}}],"mealTypes.mealtype_id":id}
    }
    db.collection('RestaurantsData').find(query).toArray((err,result) =>{
        if(err) throw err;
        res.send(result) 
    })
})



// return all the menu
app.get('/menu/:restid',(req,res) => {
var restid = Number(req.params.restid)
    db.collection('RestaurantMenu').find({restaurant_id:restid}).toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
})

app.post('/menuItem',(req, res)=>{
    console.log(req.body);
    db.collection('RestaurantMenu').find({menu_id:{$in:req.body}}).toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
  
})

app.put('/updateStatus/:id',(req, res)=>{
    var id = Number(req.params.id);
    var status = req.body.status?req.body.status:"Pending";
    db.collection('orders').updateOne(
        {id:id},
        {
            $set:{
                "date":"",
                "bank_status":req.body.bank_status,
                "bank":req.body.bank,
                "status":status
            }
        }
        )
        res.send("data updated")
})

// return all the orders
app.get('/orders',(req,res) => {
    db.collection('orders').find().toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
})

app.post('/placeOrder',(req, res) => {
    console.log(req.body)
    db.collection('orders').insert(req.body,(err, result) => {
        if(err) throw err
        res.send("order placed")
    })
   
})

app.delete('/deleteOrder',(req,res)=>{
db.collection('orders').remove({},(err, result) => {
    if(err) throw err;
    res.send(result)
})
})


//connecting with mongodb
MongoClient.connect(mongoLiveUrl,(err,client)=>{
    if (err) console.log("Error while connecting")
    db = client.db('augintern')
    app.listen(port,()=>{
        console.log(`listening on port ${port}`);
    }) 
})

