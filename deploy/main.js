const Database = require("@replit/database");
const TOKEN = process.env['TOKEN'];
const APP_ID = process.env["APP_ID"];
const SERVER_URL = process.env["SERVER_URL"];
const Discord = require("discord.js"); 
const client = new Discord.Client();
const fetch = require("node-fetch");
const keepAlive = require("./server")

const db = new Database();

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

let whitelist;
async function initWhitelist() {
  await fetch(`${SERVER_URL}/functions/whitelistInfo?_ApplicationId=${APP_ID}`)
  .then((res) => res.json())
  .then((data) => whitelist = data.result);
}




//client.on("debug", console.log);

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
    const channel = client.channels.cache.get("919932087748919318");
    channel.send("Back to watching");
    initWhitelist();
    console.log(whitelist);
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
      isMoralisTeam = true;
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
      const channel = client.channels.cache.get("919932087748919318");
      let messageString = ":rotating_light: **SAVAGE DOUBLEPOSTERS** :rotating_light: \n";
      await fetch(`${SERVER_URL}/functions/getTopTen?_ApplicationId=${APP_ID}`)
      .then((res) => res.json())
      .then((data) => result = data.result)
      .then(() => {
        result.forEach(el => {
          let discordUsername = el.discordUsername;
          let discordId = el.userId;
          let deleteCount = el.deleteCount;
          messageString += `**${discordUsername}** *(${discordId})* - **${deleteCount}**\n`;
        });
        channel.send(messageString);
      })
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
  } else if (isAdmin && msg.content.substring(0, 5) === "~$wla") { 
      let result;
      let searchId = msg.content.substring(6);
      await fetch(`${SERVER_URL}/functions/whitelistAdd?_ApplicationId=${APP_ID}&userId=${searchId}`)
      .then((res) => res.json())
      .then((data) => result = data.result);
      const channel = client.channels.cache.get("919932087748919318");
      let messageString = result == 1 ? `Added ${searchId} to whitelist` : "Yikes, something ain't right (that Id seems to be already whitelisted)";
      if (result == 1) whitelist.push(searchId);
      channel.send(messageString);
  } else if (isAdmin && msg.content.substring(0, 5) === "~$wlr") {
      let result;
      let searchId = msg.content.substring(6);
      await fetch(`${SERVER_URL}/functions/whitelistRemove?_ApplicationId=${APP_ID}&userId=${searchId}`)
      .then((res) => res.json())
      .then((data) => result = data.result);
      const channel = client.channels.cache.get("919932087748919318");
      let messageString = result == 1 ? `Removed ${searchId} from whitelist` : "Yikes, something ain't right (that Id doesn't seem to be whitelisted)";
      if (result == 1) {
        for (let i = 0; i < whitelist.length; i++) {
          if (whitelist[i] == searchId) whitelist[i] = "0";
        }
      }
      channel.send(messageString);
  } else if (isAdmin && msg.content.substring(0, 5) === "~$wli") { 
    let result;
    let searchId = msg.content.substring(6);
    await fetch(`${SERVER_URL}/functions/whitelistInfo?_ApplicationId=${APP_ID}`)
    .then((res) => res.json())
    .then((data) => result = data.result);
    const channel = client.channels.cache.get("919932087748919318");
    whitelist = result;
    let messageString = ":scroll: Current whitelist: :scroll:\n";
    whitelist.forEach(el => {
      messageString += ` - ${el}`;
    })
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
      channel.send(`Delete check failed for: https://discord.com/channels/819584798443569182/${msg.channel.id}/${msg.id} from: ${msg.author.username}#${msg.author.discriminator}*(${msg.author.id})*`);

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
    let _error;
    let deleteCheck = await fetch(`${SERVER_URL}/functions/onMessage?_ApplicationId=${APP_ID}&userId=${params.userId}&currentMessage=${params.currentMessage}
    &discriminator=${params.discriminator}&discordUsername=${params.discordUsername}`)
    .catch((err) => {
      console.log(err);
      _delCheckFail = true;
      _error = err;
    })
    if (_delCheckFail) {
      deleteCheck = false;
      channel.send(_error);
      channel.send(`Delete check failed for: https://discord.com/channels/819584798443569182/${msg.channel.id}/${msg.id} 
       from: ${msg.author.username}#${msg.author.discriminator}*(${msg.author.id})*`);
    } else {
      deleteCheck = await deleteCheck.json();
      deleteCheck = deleteCheck.result;
    }
    //console.log(deleteCheck);
    const whiteListArray = ["gm", "gm!", "gm!!!", "gm!!!!", "gn", "gn!", "!rank"];
    const channelWhitelist = ["876079404676186112", "932570355372023828"];
    if (whiteListArray.includes(currentMessageString) || channelWhitelist.includes(msg.channel.id) || whitelist.includes(currentAuthor.id)) {
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

//IGNORE - migration functions below

async function userExists(userId) {
  const entries = db.list();
  entries.forEach(el => {
    if (el.userId == usedId) return true;
  });
  return false;
}

async function onMessage(req) {
  const userId = req.userId;
  const currMsg = req.currentMessage;
  const discordUsername = req.discordUsername;
  const discriminator = req.discriminator;

  const userExists = await userExists(userId);
  if (!userExists) {
        let newUser = {};
        newUser.lastMessage = currMsg;
        newUser.userId = userId;
        newUser.discordUsername = discordUsername;
        newUser.discriminator = discriminator;
        newUser.deleteCount = 0;
        newUser.lastTime = Math.floor(Date.now() / 1000);
        newUser.jobSeeker = 0;
        db.set(userId, newUser);
        return false;
  }

  const updatedUser = {
    lastMessage: currMsg,
    userId: userId,
    discordUsername: discordUsername,
    discriminator: discriminator,
    deleteCount: user.deleteCount,
    lastTime: Math.floor(Date.now() / 1000),
    jobSeeker: user.jobSeeker,
  }

  let user = await db.get(userId);
  let lastMsg = user.lastMessage;
  if (lastMsg.length != currMsg.length) {
    await db.set(userId, updatedUser);
    return false;
  }

  if (lastMsg === currMsg && (Math.floor(Date.now() / 1000) - user.lastTime < 10800)) {
    updatedUser.deleteCount += 1;
    await db.set(userId, updatedUser);
    return true;
  } else {
    await db.set(userId, updatedUser);
    return false;
  }
}

async function getTopTen() {
  console.log("...");
}

async function getDeletedForUser(userId) {
  if (!userExists(userId)) return 0;
  let user = await db.get(userId);
  return user.deletCount;
}

async function resetMessage(userId) {
  if (!userExists(userId)) return 0;
  let user = await db.get(userId);
  user.lastMessage = "";
  await db.set(userId, user);
  return 1;
}

async function seekerCheck(userId) {
  if (!userExists(userId)) {
    let newUser = {};
    newUser.lastMessage = currMsg;
    newUser.userId = userId;
    newUser.discordUsername = discordUsername;
    newUser.discriminator = discriminator;
    newUser.deleteCount = 0;
    newUser.lastTime = Math.floor(Date.now() / 1000);
    newUser.jobSeeker = Math.floor(Date.now() / 1000) + 3*259200;
    db.set(userId, newUser);
    return false;
  }

  let user = await db.get(userId);
  if (user.jobSeeker > Math.floor(Date.now() / 1000)) return true;
  let updatedUser = {
    lastMessage: currMsg,
    userId: userId,
    discordUsername: discordUsername,
    discriminator: discriminator,
    deleteCount: user.deleteCount,
    lastTime: Math.floor(Date.now() / 1000),
    jobSeeker: Math.floor(Date.now() / 1000) + 3*259200,
  }
  await db.set(userId, jobSeeker);
  return false;
}

client.login(TOKEN).catch(console.error);
