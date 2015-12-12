var Discord = require("discord.js");
var JsonDB = require('node-json-db');
var winston = require('winston/lib/winston');
var ytdl = require('ytdl-core');
var fs = require('fs');
var request = require('./request');

var db = new JsonDB("data", true, false);
var quotdb = new JsonDB("quotes", true, true);
var settings = new JsonDB("login", true, true);
var quotes  = new Array();
var mybot = new Discord.Client();
var prefix = "-";
var email = "";
var password = "";
var ownerid = "";

//Load database
try{
	var prefix = db.getData("/prefix");
	var email = settings.getData("/email");
	var password = settings.getData("/password");
	var ownerid = settings.getData("/ownerid");
	console.log("Loaded databases.")
}
catch(error){
	prefix = "-";
	db.push("/prefix", "-");
	settings.push("/email", "insertEmailHere");
	settings.push("/password", "insertPasswordHere");
	settings.push("/ownerid", "putOwnerUUIDHere");
	console.log(error);
}

String.prototype.startsWith = function(item) {
    return this.substring(0, item.length) === item;
};


//Commands
mybot.on("message", function(message){
    messageRaw = message.content;
    messageLow = message.content.toLowerCase();

if(message.author.id != mybot.user.id){

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
		//temp = messageRaw.substr(messageRaw.indexOf(" ") + 1);
		_temp = message.content.split(" ");
		temp = message.content.split(" ")[1];
		console.log("Saved this quote : " + temp);

		if((_temp.length < 2) || (temp === "")){
			mybot.reply(message, "What are you trying to tell me?");
			return;
		}

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

	if(messageLow.startsWith(prefix + "quote")){
		temp = message.content.split(" ")[1];
		if(isNaN(temp) === true){
			mybot.reply(message, "Make sure you use numbers only.");
			return;
		}

		quotes = quotdb.getData("/" + message.channel.id, quotes);
		console.log("Length of Quotes Array ; " + quotes.length);

		if((temp >= quotes.length)||(temp < 0)){
			mybot.reply(message, "I don't know that quote.");
			return;
		}
		console.log("Quote is " + quotes[temp])
		mybot.sendMessage(message.channel.id, [quotes[temp]]);
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
        mybot.sendMessage(message.channel.id, "Hello. My name is " + mybot.user.username + ". You can get my commands with " + prefix + "commands.");
    }

	if(messageLow === prefix + "commands"){
		mybot.sendMessage(message.author, "My Commands {\n\
			**roll** *XdY* : Rolls a dice. X is the number of dice. Y is how many sides. You can also just roll X.\n\
			**slap** *user* : Slap a user\n\
			**boop** *user* : Boop a user\n\
			**getinfo** *user* : Get basic info on a user.\n\
			**myinfo** : Get information on yourself.\n\
			**uptime** : Check how long I've been online for.\n\
			**tell** *user*, *time(in minutes)*, *message* : Let me carry a message for you in a set amount of time.\n\
			**randomquote** : Let me tell you a random quote.\n\
			**savequote** : Tell me something for me to remember for the future!\n\
			**playaudio** *audioname.extension* : Play a song from the /sounds/ folder, or from a direct link to an audio file.\n\
			**listaudio** : List all the audio files in the /sounds/ folder.\n\
			.\n\
			**ADMIN ONLY**\n\
			**joinvoice** *voice channel* : Have me join a voice channel. Can be a name or ID.\n\
			**deletefile** *audiofile.extension* : Delete a file from the audio folder.\n\
			**stopplaying** : Stop streaming audio to the voice channel.\n\
			**leavevoice** : Leave the voice channel.\n\
			**dlaudio** *youtube video id* *filename (no extension)* : Download a song from youtube and rename the file after it downloads.\n\
			**setprefix** *prefix* : Set the command prefix.\n\
			**reloadjson** : Reload the json files.\n\
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
		if(_temp.startsWith("<@")){
			__temp = _temp.split("<@")[1].slice(0, -1);
			thisuser = message.channel.server.members.get("id", __temp);
			var gID = thisuser.gameID; if(gID === null){ gID = "none"};
			mybot.sendMessage(message.channel.id, "Username : " + thisuser.username + "\n" + "User ID : " + thisuser.id + "\n" + "User Status : " + thisuser.status + "\n" + "In Game (ID) : " + gID + "\n" + "User Avatar : " + thisuser.avatarURL);
		}else if(message.channel.server.members.has("username", _temp)){
			thisuser = message.channel.server.members.get("username", _temp);
			var gID = thisuser.gameID; if(gID === null){ gID = "none"};
			mybot.sendMessage(message.channel.id, "Username : " + thisuser.username + "\n" + "User ID : " + thisuser.id + "\n" + "User Status : " + thisuser.status + "\n" + "In Game (ID) : " + gID + "\n" + "User Avatar : " + thisuser.avatarURL);
		} else {
			mybot.sendMessage(message.channel.id, "That user isn't on this server.");
			return;
		}
}


if(messageLow.startsWith(prefix + "playaudio")){
		var temp = messageRaw.split(" ")[1];
		var path = "./sounds/";
		mybot.voiceConnection.stopPlaying();
		if(temp.startsWith("http")){
			console.log("Playing sound : " + temp);
		  mybot.voiceConnection.playFile(temp);
		}else{
			console.log("Playing sound : " + path + temp);
			mybot.voiceConnection.playFile(path + temp);
		}
}

if(messageLow === "?opuscheck"){
	var opus = require("node-opus");
	(emptiness = new Buffer(960*2)).fill(0);
	console.log((new (opus.OpusEncoder)()).encode(emptiness));
}

if(messageLow === prefix + "listaudio"){
		var array = getFiles("./sounds/");
		var temp = array.join(" , ");
		var list = temp.split("./sounds//").join("");

		mybot.sendMessage(message.channel.id, list);
}



    //Admin Commands
    if(message.author.id === ownerid){

        if(messageLow.startsWith(prefix + "setprefix")){
            console.log("Someone's asking to change the prefix.");
            prefix = messageLow.split(" ")[1];
            console.log("Set prefix to " + prefix);

            db.push("/prefix", prefix);

            mybot.sendMessage(message.channel.id, "Set prefix to " + prefix);
        }

				if(messageLow === prefix + "reloadjson"){
						try{
							db.reload();
							quotdb.reload();
							mybot.sendMessage(message.channel.id, "Reloaded json databases successfully.");
						}
						catch(er){
							mybot.sendMessage(message.channel.id, "Reloading json databases failed." + er);
						}

				}

				if(messageLow === prefix + "getchannels"){
					var channels = message.channel.server.channels;
					console.log(channels);
				}

				if(messageLow.startsWith(prefix + "dlaudio")){
						var temp = splitWithTail(messageRaw, " ", 2);
						console.log("Attempting to DL " + temp[1] + " and naming it " + temp[2]);
						var path = "./sounds/";
						var videopath = "https://www.youtube.com/watch?v=";

						var req = request(videopath + temp[1]);
						req.on('error', function(err) {
					     console.log('error', err);
							 return;
					   });

					   req.on('response', function(res) {
					     if (res.statusCode !== 200) {
					       if (res.statusCode === 302) {
					         // Redirection header.
					         return;
					       }
						     //console.log('response', res);
						     console.log('error', new Error('status code ' + res.statusCode));
								 mybot.reply(message, "Something went wrong. " + "Error : " + res.statusCode);
					       return;
					     }
							 if(res.statusCode == 404){
								 mybot.reply(message, "Something went wrong. " + "Error : 404");
								 return;
							 }


		 						if(temp.length > 1){
		 							try{
		 								ytdl(videopath + temp[1], { filter: 'audioonly' }).pipe(fs.createWriteStream( path + temp[2] + '.m4a'));

		 								mybot.reply(message, "Successfully downloaded the file and renamed it to " + temp[2] + ".m4a");
		 							}
		 							catch(err){
		 								mybot.reply(message, "Something went wrong. " + err);
		 							}

		 						} else {
		 							mybot.reply(message, "please make sure you're specifying a youtube video and a name for the file.");
		 						}

					   });
				}

				if(messageLow.startsWith(prefix + "joinvoice")){
						//temp = message.content.split(" ")[1];
						var temp = splitWithTail(messageRaw, " ", 1);
						console.log("Trying to join channel " + temp[1]);

						if(isNaN(temp[1]) == true){
							console.log("Using Name to join the channel.");
							var channel = message.channel.server.channels.get("name", temp[1]);
						}else if(isNaN(temp[1]) == false){
							console.log("Using ID to join the channel.");
							var channel = message.channel.server.channels.get("id", temp[1]);
						}

						if(channel && channel.type === "voice"){
								mybot.joinVoiceChannel(channel, err);
						} else {
								mybot.reply(message, "Channel " + temp[1] + " doesn't exist.");
						}
				}

				if((messageLow === prefix + "stopplaying")||(messageLow === prefix + "stopaudio")){
						mybot.voiceConnection.stopPlaying();
						console.log("Stopping audio streaming.");
				}

				if(messageLow === prefix + "leavevoice"){
						mybot.leaveVoiceChannel();
						console.log("Leaving voice channel.");
				}

				if(messageLow.startsWith(prefix + "deletefile")){
						var temp = splitWithTail(messageRaw, " ", 1);
						try{
							fs.unlink("./sounds/" + temp[1], function (err, data) {
							  if (err){
									return;
								} else {
									mybot.reply(message, "Deleted " + temp[1] + " successfully.");
								}
							});

						}
						catch(err){
							if (err.code === 'ENOENT') {
									console.log('File not found!');
							} else{
									console.log(err);
							}

						}

				}

        //End Admin Commands
    }
}

    //console.log(message.channel.server.name + " - #" + message.channel.name + " ||| " + message.author.username + " : " + messageRaw);
});

/*process.on('uncaughtException', function (err) {
  console.log(err);
})
*/

mybot.on("presence", function(data) {
	//if(status === "online"){
	//console.log("presence update");
	//console.log(data + " went " + data.status);
	//}
});

mybot.on("disconnected", function () {

	console.log("Disconnected!");
	process.exit(1); //exit node.js with an error

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

function getFiles (dir, files_){
    files_ = files_ || [];
    var files = fs.readdirSync(dir);
    for (var i in files){
        var name = dir + '/' + files[i];
        if (fs.statSync(name).isDirectory()){
            getFiles(name, files_);
        } else {
            files_.push(name);
        }
    }
    return files_;
}
