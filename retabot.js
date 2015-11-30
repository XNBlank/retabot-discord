var Discord = require("discord.js");
var JsonDB = require('node-json-db');
var winston = require('winston/lib/winston');

var db = new JsonDB("data", true, false);
var quotdb = new JsonDB("quotes", true, true);
var settings = new JsonDB("login", true, true);
var quotes  = new Array();
var mybot = new Discord.Client();
var prefix = "+";
var email = "";
var password = "";

//Load database
try{
	var prefix = db.getData("/prefix");
	var email = settings.getData("/email");
	var password = settings.getData("/password");
	console.log("Loaded databases.")
}
catch(error){
	prefix = "-";
	db.push("/prefix", "-");
	settings.push("/email", "insertEmailHere");
	settings.push("/password", "insertPasswordHere");
	console.log(error);
}

String.prototype.startsWith = function(item) {
    return this.substring(0, item.length) === item;
};


//Commands
mybot.on("message", function(message){
    messageRaw = message.content;
    messageLow = message.content.toLowerCase();


    if(messageLow === prefix + "ping"){
        mybot.reply(message, "pong");
    }

    if(messageLow.startsWith(prefix + "boop")){
        _temp = message.content.split(" ")[1];

		if(_temp.startsWith("<@")){
			__temp = _temp.split("<@")[1].slice(0, -1);
			thisuser = message.channel.server.members.get("id", __temp);
			mybot.sendMessage(message.channel.id, "*boops " + thisuser + "*");
		} else if(message.channel.server.members.has("username", _temp)){
			thisuser = message.channel.server.members.get("username", _temp);
            mybot.sendMessage(message.channel.id, "*boops " + thisuser + "*");
        } else {
            mybot.sendMessage(message.channel.id, "That user isn't on this server.");
        }
    }

	if(messageLow.startsWith(prefix + "slap")){
        _temp = message.content.split(" ")[1];

		if(_temp.startsWith("<@")){
			__temp = _temp.split("<@")[1].slice(0, -1);
			thisuser = message.channel.server.members.get("id", __temp);
			mybot.sendMessage(message.channel.id, "*slaps " + thisuser + " with a large fishbot*");
		} else if(message.channel.server.members.has("username", _temp)){
			thisuser = message.channel.server.members.get("username", _temp);
            mybot.sendMessage(message.channel.id, "*slaps " + thisuser + " with a large fishbot*");
        } else {
            mybot.sendMessage(message.channel.id, "That user isn't on this server.");
        }
    }

	if(messageLow.startsWith(prefix + "tell")){
		var temp = splitWithTail(messageRaw, " ", 3);
		console.log(temp);
		if(temp.length <= 1){
			return;
		}
		if((temp[1].startsWith("<@"))||message.channel.server.members.has("username", temp[1])){
			if(isNaN(temp[2]) == false){
				if(temp[3] != ""){
					var time = temp[2] * 60000;
					if(temp[1].startsWith("<@")){
						__temp = temp[1].split("<@")[1].slice(0, -1);
						var thisuser = message.channel.server.members.get("id", __temp);
					}else{
						var thisuser = message.channel.server.members.get("username", temp[1]);
					}
					console.log("Send message '" + temp[3] + "' in " + time + " milliseconds. (Or " + temp[2] + " minutes.)");
					mybot.reply(message, "I'll be sure to tell them that in " + msToTime(time) + ".");
					setTimeout(function() {sendTell(message.channel.id,thisuser,temp[3])}, time);
				} else {
					mybot.reply(message, "What did you want to tell them?");
					return;
				}
			} else {
				mybot.reply(message, "Make sure your second entry is the amount of minutes you want me to wait.");
				return;
			}
		} else {
			mybot.sendMessage(message.channel.id, "That user isn't on this server.");
			return;
		}
	}

	if(messageLow.startsWith(prefix + "savequote")){
		temp = messageRaw.substr(messageRaw.indexOf(" ") + 1);
		console.log("Saved this quote : " + temp);
		try{
			quotes = quotdb.getData("/" + message.channel.id, quotes);
			quotes.push(temp);
			quotdb.push("/" + message.channel.id, quotes);
		}
		catch(error){
			var tempquotes = new Array();

			tempquotes.push(temp);
			quotdb.push("/" + message.channel.id, tempquotes);
		}

		mybot.reply(message, "Saved quote succesfully.");
	}

	if(messageLow === prefix + "randomquote"){
		try{
			quotes = quotdb.getData("/" + message.channel.id, quotes);
			console.log("Length of Quotes Array ; " + quotes.length);
			var rand = Math.floor(Math.random()*quotes.length);
			console.log("Quote is " + quotes[rand])
			mybot.sendMessage(message.channel.id, [quotes[rand]]);
		}
		catch(error){
			console.log("Error : " + error)
			mybot.reply(message, "I don't know anything! Why not tell me some with **" + prefix + "savequote**.");
		}
	}

	if(messageLow.startsWith(prefix + "roll")){
		temp = message.content.substr(message.content.indexOf(" ") + 1);

		if(temp === "blunt"){
			mybot.reply(message, "pass the weed!");
			return;
		}

		if(temp.length >= 1){
			var secondNum = 0;
			var secondDie = 0;

			if(temp.length > 2){
				if(temp.indexOf("d") > -1){
					temp2 = temp.split("d");
					console.log("Is not a number? temp2[0] ; " + isNaN(temp2[0]));
					console.log("Is not a number? temp2[1] ; " + isNaN(temp2[1]));

					if((isNaN(temp2[0]) == false) && (isNaN(temp2[1]) == false)){
						secondNum = temp2[1];
						number = temp2[0];
						if(number > 99){
							mybot.reply(message, "I don't have that many dice!");
							return;
						}

						if(secondNum > 99){
							mybot.reply(message, "I can't count that high! I'm only just a seal!");
							return;
						}

						if((number < 1) || (secondNum < 1)){
							mybot.reply(message, "I don't know how I'm supposed to do that!");
							return;
						}

						if((number >= 1) && (secondNum >= 1)){
							var nextvalue = [];
							for(var i = 0; i < number; i++){
								var max = secondNum;
								var min = 1;
								var rand = (Math.floor(Math.random() * max - min) + min + 1);

								nextvalue.push(rand);
							}
							var outcome = nextvalue.toString();
							var compile = eval(nextvalue.join("+"));
							mybot.reply(message, "you rolled " + number + " D" + secondNum + "s and got [" + outcome + "] which equals " + compile);
							return;
						}

					} else if ((isNaN(temp2[0]) == true) || (isNaN(temp2[1]) == true)){
						mybot.reply(message, "Make sure you are using only numbers and \"d\" to roll more than 1 dice.");
						return;
					}
				}
			} else {

				if(isNaN(temp) == false){
					var number = parseInt(temp);
					if(number > 99){
						mybot.reply(message, "I can't count that high! I'm only just a seal!");
						return;
					}

					if(number < 1){
						mybot.reply(message, "I don't know how I'm supposed to do that!");
						return;
					}

					if(number >= 1){
						var nextvalue = [];
						for(var i = 0; i < number; i++){
							var max = 6;
							var min = 1;
							var rand = (Math.floor((Math.random() * max - min) + min + 1));
							nextvalue.push(rand);
						}

						var outcome = nextvalue.toString();
						var compile = eval(nextvalue.join('+'));
						mybot.reply(message, "you rolled " + number + " D6s and got [" + outcome + "] which equals " + compile);
						return;
					} else {
						mybot.reply(message, "Make sure you are using only numbers to roll the dice.");
						return;
					}
				}

			}
		}
	}

    if(messageLow === prefix + "help"){
        mybot.sendMessage(message.channel.id, "Hello. My name is " + mybot.user.username + ".");
    }

	if(messageLow === prefix + "commands"){
		mybot.sendMessage(message.channel.id, "My Commands {\n\
			**roll** *XdY* : Rolls a dice. X is the number of dice. Y is how many sides. You can also just roll X.\n\
			**slap** *user* : Slap a user\n\
			**boop** *user* : Boop a user\n\
			**getinfo** *user* : Get basic info on a user.\n\
			**myinfo** : Get information on yourself.\n\
			**uptime** : Check how long I've been online for.\n\
			**tell** *user*, *time(in minutes)*, *message* : Let me carry a message for you in a set amount of time.\n\
			**randomquote** : Let me tell you a random quote.\n\
			**savequote** : Tell me something for me to remember for the future!\n\
		}")
	}

    if(messageLow === prefix + "uptime"){
        utime = msToTime(mybot.uptime);
        mybot.sendMessage(message.channel.id, "Uptime : " + utime);
    }

    if(messageLow === prefix + "myinfo"){
        var gID = message.author.gameID; if(gID === null){ gID = "none"};
        mybot.sendMessage(message.channel.id, "Username : " + message.author.username + "\n" + "User ID : " + message.author.id + "\n" + "User Status : " + message.author.status + "\n" + "In Game (ID) : " + gID + "\n" + "User Avatar : " + message.author.avatarURL);
    }

	if(messageLow.startsWith(prefix + "getinfo")){
		_temp = message.content.split(" ")[1];
		thisuser = message.channel.server.members.get("username", _temp);

		var gID = thisuser.gameID; if(gID === null){ gID = "none"};
		mybot.sendMessage(message.channel.id, "Username : " + thisuser.username + "\n" + "User ID : " + thisuser.id + "\n" + "User Status : " + thisuser.status + "\n" + "In Game (ID) : " + gID + "\n" + "User Avatar : " + thisuser.avatarURL);
	}


    //Admin Commands
    if(message.author.id === "68847303431041024"){

        if(messageLow.startsWith(prefix + "setprefix")){
            console.log("Someone's asking to change the prefix.");
            prefix = messageLow.split(" ")[1];
            console.log("Set prefix to " + prefix);

            db.push("/prefix", prefix);

            mybot.sendMessage(message.channel.id, "Set prefix to " + prefix);
        }

        //End Admin Commands
    }


    console.log(message.channel.server.name + " - #" + message.channel.name + " ||| " + message.author.username + " : " + messageRaw);
});


//Ready?
mybot.on("ready", function(){
    console.log("Bot Name : " + mybot.user.username);
    console.log("Bot ID : " + mybot.user.id);
});

//login
mybot.login(email, password).then(success).catch(err);


//Catches and extra functions
function success(token){
    console.log("Logged in successfully with token id " + token);
}

function err(error){
    console.log(error);
}

function msToTime(s) {

  function addZ(n) {
    return (n<10? '0':'') + n;
  }

  var ms = s % 1000;
  s = (s - ms) / 1000;
  var secs = s % 60;
  s = (s - secs) / 60;
  var mins = s % 60;
  var hrs = (s - mins) / 60;

  return addZ(hrs) + ':' + addZ(mins) + ':' + addZ(secs);
}

function sendTell(chid,u,m){

	mybot.sendMessage(chid, u + " : " + m);
}

function splitWithTail(str,delim,count){
  var parts = str.split(delim);
  var tail = parts.slice(count).join(delim);
  var result = parts.slice(0,count);
  result.push(tail);
  return result;
}
