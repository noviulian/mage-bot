const TOKEN = process.env['TOKEN'];
const APP_ID = process.env["APP_ID"];
const SERVER_URL = process.env["SERVER_URL"];
const Discord = require("discord.js"); 
const client = new Discord.Client();
const fetch = require("node-fetch");
const keepAlive = require("./server")

keepAlive();

//client.on("debug", console.log);

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
    
    

    const channel = client.channels.cache.get("919932087748919318");
    let deleteCheck = await fetch(`${SERVER_URL}/functions/onMessage?_ApplicationId=${APP_ID}&userId=${params.userId}&currentMessage=${params.currentMessage}
    &discriminator=${params.discriminator}&discordUsername=${params.discordUsername}`);
    deleteCheck = await deleteCheck.json();
    deleteCheck = deleteCheck.result;
    if (deleteCheck) {
      msg.delete();
      currentAuthor.send("Please do not post the same message multiple times, thanks!");
      channel.send(`${currentAuthor.username}#${currentAuthor.discriminator}: ${currentMessageString} - DELETED in <#${msg.channel.id}>`);
    }
    console.log(`${currentAuthor.username}#${currentAuthor.discriminator}: ${currentMessageString} - ${deleteCheck}`);
  }
});

client.login(TOKEN);