//Everything up until BOT CODE is just to keep the bot alive
const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => res.send('Hello World!'));
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));


//BOT CODE
const TOKEN = process.env['TOKEN'];
const APP_ID = process.env["APP_ID"];
const SERVER_URL = process.env["SERVER_URL"];
const Discord = require("discord.js"); 
const client = new Discord.Client();
const fetch = require("node-fetch");

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on("message", async (msg) => {
  if (msg.author.id != "926422385094168577" && !msg.author.bot && !msg.system && msg.content != ""){
    let currentAuthor = msg.author;
    let currentMessageString;
    if (msg.content.length < 30) {
        currentMessageString = msg.content.toLowerCase();
    } else {
        currentMessageString = msg.content.slice(0, 30).toLowerCase();
    }

    let params = {
        userId: currentAuthor.id,
        discordUsername: currentAuthor.username,
        discriminator: currentAuthor.discriminator,
        currentMessage: currentMessageString
    };
    
    

    //const channel = client.channels.cache.get(msg.channel.id);
    let deleteCheck = await fetch(`${SERVER_URL}/functions/onMessage?_ApplicationId=${APP_ID}&userId=${params.userId}&currentMessage=${params.currentMessage}
    &discriminator=${params.discriminator}&discordUsername=${params.discordUsername}`);
    deleteCheck = await deleteCheck.json();
    deleteCheck = deleteCheck.result;
    if (deleteCheck) {
      msg.delete();
      currentAuthor.send("Please do not post the same message in multiple channels, thanks!");
    }
    console.log(`${currentAuthor.username}#${currentAuthor.discriminator}: ${currentMessageString} - ${deleteCheck}`);
  }
});

client.login(TOKEN);