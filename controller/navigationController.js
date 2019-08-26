var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
var mongoose = require('mongoose');

var urlencodedParser = bodyParser.urlencoded({extended: false});

mongoose.connect('mongodb+srv://test:test@smashboards-wxzrm.mongodb.net/SmashBoards?retryWrites=true&w=majority', {useNewUrlParser: true});

var gameSchema = new mongoose.Schema({
    players:[{name:String, character:String, kills:Number, deaths:Number}],
    winner:String,
    winningCharacter:String,
    map:String,
    numberOfPlayers:Number
});
var Game = new mongoose.model('Game', gameSchema);
var userSchema = new mongoose.Schema({
        name:String,
        kills:Number,
        deaths:Number,
        gamesPlayed:Number,
        gamesWon:Number,
        charactersUsed:{}
    });
var User = new mongoose.model('User', userSchema);
var characterSchema = new mongoose.Schema({
    name:String,
    kills:Number,
    deaths:Number,
    gamesPlayed:Number,
    gamesWon:Number,
    players:{}
});
var allCharacters =[];
var Character = new mongoose.model('Character', characterSchema);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(){
    //we're connected
    Character.find(function (err, characters){
        if (err) return console.error(err);
        console.log(characters);
        
        for(var i = 0; i < characters.length; i++){
            allCharacters.push(characters[i].name);
        }
        console.log(allCharacters)
    });
    console.log('connected to Database');

    // var pacman = new Character({name:"Samus", kills:0, deaths:0 , gamesPlayed:0, gamesWon:0, players:{}});
    // pacman.save(function(err, pacman){
    //     if (err) return console.error(err);
    //     else{console.log(pacman.name + " Saved");}
    // });
    
    // var game1 = new Game({players:[{name:'Brian', character:"Pac-Man", kills:5, deaths:2, damageDone:123, damageTaken:97}],
    //     winner:"Brian"});
    //     console.log(game1.players)
    //     game1.save(function(err, game1){
    //         if(err) return console.error(err);
    //         else{console.log("Game Saved");}
    //     })
    
    // var brian = new User({name:"Brian", kills:0, gamesPlayed:0, gamesWon:0});
    // console.log(brian.name);
    // brian.save(function(err, brian){
    //     if (err) return console.error(err);
    //     else{console.log("Saved")}
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
        var keys = Object.keys(character.players);
        console.log(keys);
        res.render('character',{character:character, keys:keys});
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
router.get('/addGame', urlencodedParser, function(req,res){
    console.log(parseInt(req.query.numberOfPlayers));
    res.render('addGame',{numberOfPlayers: parseInt(req.query.numberOfPlayers), allCharacters:allCharacters});
});
router.post('/addGame', urlencodedParser, function(req, res){
    console.log(req.body);
    console.log("post recieved");
    var values = Object.values(req.body);
    console.log(values);
    var players = [];
    
    for(var i = 4; i < values.length; i++){
        if(i % 4 == 0){
            var player = {name: '', character:'', kills: 0, deaths: 0};
            player.name = values[i];
        }
        else if(i % 4 == 1){
            player.character = values[i];
        }
        else if(i % 4 == 2){
            player.kills = parseInt(values[i]);
        }
        else if(i % 4 == 3){
            player.deaths = parseInt(values[i]);
            players.push(player);
        }
        
    }
    var newGame = new Game({players: players, map: req.body.map, winner: req.body.winner, winningCharacter: req.body.winningCharacter, numberOfPlayers:parseInt(req.body.numberOfPlayers)});
    console.log(newGame);
    newGame.save(function(err, newGame){
        if(err) return console.error(err);
        else{
            console.log('Game Saved');
            updateUsersAndCharacters(newGame.players, newGame.winner, newGame.winningCharacter);
            res.redirect('/gamesBoard');
        }
    });
});
router.post('/deleteGame', urlencodedParser, function(req,res){
    console.log(req.body);
    console.log(req.path);
    Game.findById(req.body.gameId, function(err, game){
            if (err) return console.error(err);
            game.remove(function(err){
                if (err) return console.error(err);
                res.redirect('/gamesBoard');
            })
            
        });
    
});
router.post('/deleteUser', urlencodedParser, function(req,res){
    User.findById(req.body.userId, function(err, user){
        if (err) return console.error(err);
        user.remove(function(err){
            if (err) return console.error(error);
            res.redirect('/usersBoard');
        })
        
    });
});
router.post('/addUser', urlencodedParser, function(req,res){
    console.log(req.body.username);
    var user = new User({name: req.body.username, kills:0, deaths:0, gamesPlayed:0, gamesWon:0,charactersUsed:{}});
    for(var i = 0 ; i < allCharacters.length; i++){
        user.charactersUsed[allCharacters[i]]={kills:0,deaths:0,gamesPlayed:0,gamesWon:0};
    }
    user.save(function(err){
        if (err) return console.error(err);
        else{console.log("Saved")}
        res.redirect('/usersBoard');
    });
    
});
router.post('/addCharacter', urlencodedParser, function(req,res){
    console.log(req.body.characterName);
    var character = new Character({name: req.body.characterName, kills:0, deaths:0, gamesPlayed:0, gamesWon:0, players:{Brian:{kills:0, deaths:0, gamesPlayed:0, gamesWon:0}}});
    
    character.save(function(err){
        if (err) return console.error(err);
        else{console.log("Saved")}
        allCharacters.push(character.name);
        res.redirect('/charactersBoard');
    });
    
});
function updateUsersAndCharacters(users, winner, winningCharacter){
    console.log(users);
    console.log('******************');
    for(var i = 0; i < users.length; i++){
        updateUser(users[i], winningCharacter);
        updateCharacter(users[i], winner);
    };
    User.findOne({name: winner}, function(err,dbUser){
        if (err) return console.error(err);
        dbUser.gamesWon += 1;
        dbUser.save(function(err){
            if(err) return console.error(err);
        });
    });
    Character.findOne({name: winningCharacter}, function(err,dbCharacter){
        if (err) return console.error(err);
        dbCharacter.gamesWon += 1;
        dbCharacter.save(function(err){
            if(err) return console.error(err);
        });
    });

};
function updateUser(user, winningCharacter){
    User.findOne({name: user.name}, function(err,dbUser){
        if (err) return console.error(err);
        dbUser.kills += user.kills;
        dbUser.deaths += user.deaths;
        dbUser.gamesPlayed +=1;
        if(Object.keys(dbUser.charactersUsed).includes(user.name)){
            dbUser.charactersUsed[user.character].kills += user.kills;
            dbUser.charactersUsed[user.character].deaths += user.deaths;
            dbUser.charactersUsed[user.character].gamesPlayed += 1;
            console.log(dbUser.charactersUsed[user.character])
            dbUser.markModified('charactersUsed');
        }
        else{
            dbUser.charactersUsed[user.character] = {kills: user.kills, deaths: user.deaths, gamesPlayed: 1, gamesWon:0};
            dbUser.markModified('charactersUsed');
        }
        if(user.character == winningCharacter){
            dbUser.charactersUsed[user.character].gamesWon += 1;
        }
        dbUser.save(function(err){
            if(err) return console.error(err);
        });
    });
};
function updateCharacter(player, winningUser){
    Character.findOne({name: player.character}, function(err, dbCharacter){
        if (err) return console.error(err);
        console.log(dbCharacter.name);
        dbCharacter.kills += player.kills;
        dbCharacter.deaths += player.deaths;
        dbCharacter.gamesPlayed += 1;
        if(Object.keys(dbCharacter.players).includes(player.name)){
            console.log('true');
            dbCharacter.players[player.name].kills += player.kills;
            dbCharacter.players[player.name].deaths += player.deaths;
            dbCharacter.players[player.name].gamesPlayed += 1;
            dbCharacter.markModified('players');
        }
        else{
            console.log('false');
            console.log(player.name);
            dbCharacter.players[player.name] = {kills: player.kills, deaths: player.deaths, gamesPlayed: 1, gamesWon:0};
            console.log(dbCharacter.players[player.name]);
            dbCharacter.markModified('players');
        }
        if(player.name == winningUser){
            dbCharacter.players[player.name].gamesWon += 1;
        }
        dbCharacter.save(function(err){
            if(err) return console.error(err);
        });
    });
}

module.exports = router;