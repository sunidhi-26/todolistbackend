const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const _ = require("lodash");
const date = require(__dirname + "/date.js");

// console.log(date());

//to initiate dotenv and make your environment variables available throughout your application
dotenv.config();

mongoose.set('strictQuery', true);

const app = express();

mongoose.connect(process.env.MONGO_URL);

const itemsSchema = new mongoose.Schema({
    name : String
});
const Item = mongoose.model("Item", itemsSchema);


const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
})
const List = mongoose.model("List", listSchema);


const item1 = new Item({
    name: "Welcome to the To-Do List!"
})
const item2 = new Item({
    name: "For creating a separate list, you can go to /list/listname."
})

const defaultItems = [item1, item2];

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');

app.get("/", function(req,res) {
    const day = date.getDate();

    Item.find().then((itemsArray)=> {
        if (itemsArray.length === 0) {
            Item.insertMany(defaultItems)
            .then(() => {
                console.log("Successfully inserted the default items to DB!")
            })
            .catch(err => {
                console.log(err);
            })
            res.redirect("/");
        } else {
            res.render('list', {listTitle: day, newItemList: itemsArray});
        }
    })
    .catch(err => {
        console.log(err);
    })
})

app.get("/list/:customListName", function(req,res) {
    // console.log(req.params.customListName);
    const customListName = _.capitalize(req.params.customListName);
    
    List.findOne({name: customListName})
    .then(listFound => {
        // console.log(listFound.name);
        if (listFound) {
            // show an existing list
            res.render("list", {listTitle: listFound.name, newItemList: listFound.items});
        } else {
            // create a new list
            const list = new List({
                name: customListName,
                items: defaultItems
            })
            list.save();
            res.redirect("/list/" + customListName);
        }
    })
    .catch(err => {
        console.log(err);
    })
})

app.get("/about", function(req,res){
    res.render("about");
})

app.post("/", function(req,res){
    // console.log(req.body);
    const itemName = req.body.newItem;
    const listName = req.body.listButton;

    const newItem = new Item({
        name: itemName
    })

    if (listName === date.getDate()) {
        newItem.save();
        console.log("One item added to the main list.")
        res.redirect("/");
    } else {
        List.findOne({name: listName}).then(foundList => {
            // console.log(foundList);
            console.log("One item added to the " + listName + " list.")
            foundList.items.push(newItem);
            foundList.save();
            res.redirect("/list/" + listName);
        }).catch(err => {
            console.log(err);
        })
    }
})

app.post("/delete", function(req,res){
    // console.log(req.body);
    const checkedItemId = req.body.checkboxItem;
    const listName = req.body.hiddenInput;

    if (listName === date.getDate()) {
        Item.findByIdAndRemove(checkedItemId)
        .then(() => {
            console.log("One item has been deleted from main list.");
        })
        .catch(function(err) {
            console.log(err);
        });
        res.redirect("/");
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}})
        .then(()=>{
            console.log("One item has been deleted from the " + listName + " list.")
        })
        .catch(err => {
            console.log(err);
        })
        res.redirect("/list/" + listName);
    }
})

app.listen("3000", function(req,res){
    console.log("Server is running on port 3000");
})