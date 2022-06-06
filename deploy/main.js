const TOKEN = process.env['TOKEN'];
const APP_ID = process.env["APP_ID"];
const SERVER_URL = process.env["SERVER_URL"];
const Discord = require("discord.js"); 
const client = new Discord.Client();
const fetch = require("node-fetch");
const keepAlive = require("./server")

keepAlive();

const ADMIN_TEAM_IDS = [
  "343413591514284032", //kone
  "208898272637485057", //mauro
  "797456657399152670", //kresimir
  "940209372531937291", //rain
  "706259952297181265", //crypto kid
  "699187270455918664", //nikolas
  "931340565533065276", //glad
];

//client.on("debug", console.log);

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on("message", async (msg) => {
  let currentAuthor = msg.author;
  let isMoralisTeam = false;

  /*if (msg.member.roles.cache.find(r => r.name === "Moralis Team")) {
    isMoralisTeam = true;
  }*/
  adminrole = msg.member.roles.cache.find(role => role.name == "Moralis Team");
  if(adminrole != null){
    isMoralisTeam = true;
    let currentMessageString;
    if (msg.content.length < 30) {
        currentMessageString = msg.content.toLowerCase();
    } else {
        currentMessageString = msg.content.slice(0, 30).toLowerCase();
    }
    console.log(`${currentAuthor.username}#${currentAuthor.discriminator}: ${currentMessageString} - Team`);
  } else {
    isMoralisTeam = false;
  }

  let isAdmin = false;
  ADMIN_TEAM_IDS.forEach(el => {
    if (msg.author.id === el) {
      isAdmin = true;
    }
  });

  if (isAdmin && msg.content.substring(0, 7) === "~$check") {
    let searchId = msg.content.substring(8);
    let result;
    await fetch(`${SERVER_URL}/functions/getDeletedForUser?_ApplicationId=${APP_ID}&userId=${searchId}`)
    .then((res) => res.json())
    .then((data) => result = data.result);
    const channel = client.channels.cache.get("919932087748919318");
    if (result != undefined) {
      channel.send(`I have deleted messages from *${searchId}* **${result} times**`);
    } else {
      channel.send(`I have deleted messages from *${searchId}* **0 times**`);
    }
  } else if (isAdmin && msg.content.substring(0, 5) === "~$top") {
    let result;
    await fetch(`${SERVER_URL}/functions/getTopTen?_ApplicationId=${APP_ID}`)
    .then((res) => res.json())
    .then((data) => result = data.result);
    const channel = client.channels.cache.get("919932087748919318");
    let messageString = ":rotating_light: **SAVAGE DOUBLEPOSTERS** :rotating_light: \n";
    result.forEach(el => {
      let discordUsername = el.attributes.discordUsername;
      let discordId = el.attributes.userId;
      let deleteCount = el.attributes.deleteCount;
      messageString += `**${discordUsername}** *(${discordId})* - **${deleteCount}**\n`;
    });
    channel.send(messageString);
  } else if (isAdmin && msg.content.substring(0, 7) === "~$clear") {
    let result;
    let searchId = msg.content.substring(8);
    await fetch(`${SERVER_URL}/functions/resetMessage?_ApplicationId=${APP_ID}&userId=${searchId}`)
    .then((res) => res.json())
    .then((data) => result = data.result);
    const channel = client.channels.cache.get("919932087748919318");
    //console.log(result);
    let messageString = result == 1 ? `Cleared message history for ${searchId}` : "Yikes, something ain't right";
    channel.send(messageString);
  } else if (!isAdmin && msg.channel.id == "970071769589370890") { //check if message is in job-seekers
    let _delCheckFail = false;
    let deleteCheck = await fetch(`${SERVER_URL}/functions/seekerCheck?_ApplicationId=${APP_ID}&userId=${msg.author.id}`)
    .catch((err) => {
      console.log(err);
      _delCheckFail = true;
    })
    const channel = client.channels.cache.get("919932087748919318");
    if (_delCheckFail) {
      deleteCheck = false;
      channel.send(`Delete check failed for msgId: ${msg.id} from user: ${msg.author.id}`);
    } else {
      deleteCheck = await deleteCheck.json();
      deleteCheck = deleteCheck.result;
    }
    
    if (deleteCheck) {
      msg.delete();
      currentAuthor.send("It has not been 3 days since your last post in <#970071769589370890>");
      channel.send(`${currentAuthor.username}#${currentAuthor.discriminator} tried to post in <#970071769589370890> while on cooldown`);
    }
    console.log(`${currentAuthor.username}#${currentAuthor.discriminator} posted in job-seekers => ${deleteCheck}`);
  } else if (msg.author.id != "926422385094168577" && !msg.author.bot && !msg.system && msg.content != "" && !isMoralisTeam){
    //msg.reply(msg.content);
    //console.log(currentAuthor);
    //console.log(msg);


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
    //console.log(channel);
    let _delCheckFail = false;
    let deleteCheck = await fetch(`${SERVER_URL}/functions/onMessage?_ApplicationId=${APP_ID}&userId=${params.userId}&currentMessage=${params.currentMessage}
    &discriminator=${params.discriminator}&discordUsername=${params.discordUsername}`)
    .catch((err) => {
      console.log(err);
      _delCheckFail = true;
    })
    if (_delCheckFail) {
      deleteCheck = false;
      channel.send(`Delete check failed for msgId: ${msg.id} from user: ${msg.author.id}`);
    } else {
      deleteCheck = await deleteCheck.json();
      deleteCheck = deleteCheck.result;
    }
    //console.log(deleteCheck);
    const whiteListArray = ["gm", "gm!", "gm!!!", "gm!!!!", "gn", "gn!"];
    const channelWhitelist = ["876079404676186112", "932570355372023828"];
    if (whiteListArray.includes(currentMessageString) || channelWhitelist.includes(msg.channel.id)) {
      deleteCheck = false;
    }
    if (deleteCheck) {
      msg.delete();
      currentAuthor.send("Please do not post the same message multiple times, thanks!");
      channel.send(`${currentAuthor.username}#${currentAuthor.discriminator}: ${currentMessageString} - DELETED in <#${msg.channel.id}>`);
    }
    console.log(`${currentAuthor.username}#${currentAuthor.discriminator}: ${currentMessageString} - ${deleteCheck}`);
  }
});

client.login(TOKEN).catch(console.error);
