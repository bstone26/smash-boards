var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

mongoose.connect('mongodb+srv://test:test@smashboards-wxzrm.mongodb.net/SmashBoards?retryWrites=true&w=majority', {useNewUrlParser: true});

var gameSchema = new mongoose.Schema({
    players:[{name:String, character:String, kills:Number, deaths:Number, damageDone:Number, damageTaken:Number}],
    winner:String,
    winningCharacter:String
});
var Game = new mongoose.model('Game', gameSchema);
var userSchema = new mongoose.Schema({
        name:String,
        kills:Number,
        gamesPlayed:Number,
        gamesWon:Number,
        charactersUsed:Array
    });
var User = new mongoose.model('User', userSchema);
var characterSchema = new mongoose.Schema({
    name:String,
    kills:Number,
    gamesPlayed:Number,
    gamesWon:Number
});
var Character = new mongoose.model('Character', characterSchema);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(){
    //we're connected
    console.log('connected to Database');

   
    // var Game = new mongoose.model('Game', gameSchema);
    // var id = 0;
    // Game.find(function (err, games){
    //     if (err) return console.error(err);
    //     console.log(games);
    //     id = games[0]._id
    //     console.log(id);
    // });
    // console.log(id);
    // Game.findById(id, function(err, game){
    //     if (err) return console.error(err);
    //     console.log(game);
    // });
    // var game1 = new Game({players:[{name:'Brian', character:"Pac-Man", kills:5, deaths:2, damageDone:123, damageTaken:97}],
    //     winner:"Brian"});
    //     console.log(game1.players)
    //     game1.save(function(err, game1){
    //         if(err) return console.error(err);
    //         else{console.log("Game Saved");}
    //     })
    // var smashSchema = new mongoose.Schema({
    //     name:String,
    //     kills:Number,
    //     gamesPlayed:Number,
    //     gamesWon:Number,
    //     charactersUsed:Array
    // });
    // var User = new mongoose.model('User', userSchema);
    // var brian = new User({name:"Eric", kills:0, gamesPlayed:0, gamesWon:0});
    // console.log(brian.name);
    // brian.save(function(err, brian){
    //     if (err) return console.error(err);
    //     else{console.log("Saved")}
    // });
    // var pacman = new Character({name:"Pac-Man", kills:0, gamesPlayed:0, gamesWon:0});
    // pacman.save(function(err, pacman){
    //     if (err) return console.error(err);
    //     else{console.log(pacman.name + " Saved");}
    // });
});


router.get('/', function(req, res) {
    console.log(req.path);
    res.render('index');
});
router.get('/charactersBoard', function(req, res) {
    Character.find(function (err, characters){
        if (err) return console.error(err);
        console.log(characters);
        res.render('charactersBoard',{characters:characters});
    });
    console.log(req.path)
});
router.get('/character/:id', function(req, res){
    Character.findById(req.params.id, function(err, character){
        if (err) return console.error(err);
        console.log(character.name);
        res.render('character',{character:character});
    });
    
});
router.get('/usersBoard', function(req, res){
    User.find(function (err, users){
        if (err) return console.error(err);
        console.log(users);
        res.render('usersBoard',{users:users});
    });
    console.log(req.path);
    
});
router.get('/user/:id', function(req, res){
    User.findById(req.params.id, function(err, user){
        if (err) return console.error(err);
        console.log(user.name);
        res.render('user',{user:user});
    });
    
});
router.get('/gamesBoard', function(req, res){
    Game.find(function (err, games){
            if (err) return console.error(err);
            console.log(games);
            res.render('gamesBoard', {games:games});
        });
    console.log(req.path)
    
});
router.get('/game/:id', function(req, res){
    Game.findById(req.params.id, function(err, game){
        if (err) return console.error(err);
        console.log(game.winner);
        res.render('game', {game:game});
    });
});

module.exports = router;