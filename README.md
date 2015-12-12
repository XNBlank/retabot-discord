# Retabot-Discord
## Friendly Fun Sealbot for Discord. Uses discord-js.



# Libraries used
- discord.js
- winston
- node-json-db


# How to install 
```
$ npm install --save retabot-discord
```

# Usage

Make sure to edit login.json, and change your email and password.

```
{
    "email": [
        "insertEmailHere"
    ],
    "password": [
        "insertPasswordHere"
    ]
}
```


Then in console in the bot directory, run
```
$ node retabot.js
```

# Commands

`roll` **XdY** : Rolls a dice. X is the number of dice. Y is how many sides. You can also just roll X.

`slap` **user** : Slap a user.

`boop` **user** : Boop a user.

`getinfo` **user** : Get basic info on a user.

`myinfo` : Get information on yourself.

`uptime` : Check how long I've been online for.

`tell` [**user, time(in minutes), message**] : Let me carry a message for you in a set amount of time.

`randomquote` : Let me tell you a random quote.

`savequote` : Tell me something for me to remember for the future!

`playaudio` **audioname.extension** : Play a song from the /sounds/ folder, or from a direct link to an audio file.

`listaudio` : List all the audio files in the /sounds/ folder.

### Admin Only Commands

`joinvoice` **voice channel** : Have me join a voice channel. Can be a name or ID.

`deletefile` **audiofile.extension** : Delete a file from the audio folder.

`stopplaying` : Stop streaming audio to the voice channel.

`leavevoice` : Leave the voice channel.

`dlaudio` [**youtube video id**, **filename (no extension)**] : Download a song from youtube and rename the file after it downloads.

`setprefix` **prefix** : Set the command prefix.

`reloadjson` : Reload the json files.


