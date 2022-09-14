//RETURNS TO DELETE = IF RETURN TRUE => DELETE, IF RETURN FALSE => DO NOT DELETE
Moralis.Cloud.define("onMessage", async (request) => {
    let logger = Moralis.Cloud.getLogger();
    const userId = request.params.userId;
    const currMsg = request.params.currentMessage;
    const discordUsername = request.params.discordUsername;
    const discriminator = request.params.discriminator;
    
    let dcQuery = new Moralis.Query("DiscordUsers");
    dcQuery.equalTo("userId", userId);
    let userResult = await dcQuery.find({useMasterKey: true});
    let userExists = (userResult.length > 0) ? (true) : (false);

    if (!userExists) {
        let discordUser = Moralis.Object.extend("DiscordUsers");
        let newUser = new discordUser();
        newUser.set("lastMessage", currMsg);
        newUser.set("userId", userId);
        newUser.set("discordUsername", discordUsername);
        newUser.set("discriminator", discriminator);
        newUser.set("deleteCount", 0);
        newUser.save(null, {useMasterKey: true});
        return false;
    } 

    dcQuery.equalTo("userId", userId);
    let msgResult = await dcQuery.find({useMasterKey: true});
    let lastMsg = msgResult[0].attributes.lastMessage;
    let currentDelCount = msgResult[0].attributes.deleteCount;

    //logger.info(++currentDelCount);

    userResult[0].set("lastMessage", currMsg);
    userResult[0].save(null, {useMasterKey: true});

    if (lastMsg.length != currMsg.length) {
        return false;
    }
    
    if (lastMsg === currMsg) {
        if (currentDelCount === undefined) {
            userResult[0].set("deleteCount", 1);
            userResult[0].save(null, {useMasterKey: true});
        } else {
            userResult[0].set("deleteCount", ++currentDelCount);
            userResult[0].save(null, {useMasterKey: true});
        }
        return true;
    } else {
        return false;
    }
});


Moralis.Cloud.define("getTopTen", async () => {
    let logger = Moralis.Cloud.getLogger();
    //let returnObject = {};
    let countQuery = new Moralis.Query("DiscordUsers");
    countQuery.descending("deleteCount");
    countQuery.limit(10);
    let result = await countQuery.find({useMasterKey: true});
    logger.info(JSON.stringify(result));
    return result;
});

Moralis.Cloud.define("getDeletedForUser", async (request) => {
    let logger = Moralis.Cloud.getLogger();
    let userQuery = new Moralis.Query("DiscordUsers");
    userQuery.equalTo("userId", request.params.userId);
    let results = await userQuery.find({useMasterKey: true});
    if (results.length < 1) {
        return 0;
    } else {
        let result = results[0];
        logger.info(JSON.stringify(result));
        return result.attributes.deleteCount;
    }
});

Moralis.Cloud.define("resetMessage", async (request) => {
    let userQuery = new Moralis.Query("DiscordUsers");
    userQuery.equalTo("userId", request.params.userId);
    let results = await userQuery.find({useMasterKey: true});
    if (results.length < 1) {
        return 0;
    } else {
        let user = results[0];
        user.set("lastMessage", "");
        user.save();
        return 1;
    }
}); 

Moralis.Cloud.define("seekerCheck", async (request) => {
    let logger = Moralis.Cloud.getLogger();
    let timerQuery = new Moralis.Query("JobSeekersTimer");
    timerQuery.equalTo("userId", request.params.userId);
    let timerResult = await timerQuery.find({useMasterKey: true});
    let timerExists = (timerResult.length > 0) ? (true) : (false);
    if (!timerExists) {
        let seekerTimer = Moralis.Object.extend("JobSeekersTimer");
        let newUser = new seekerTimer();

        newUser.set("nextMessageTime", Math.floor(Date.now() / 1000) + 259200);
        newUser.set("userId", request.params.userId);
        newUser.save(null, {useMasterKey: true});
        return false;
    }

    let timer = timerResult[0].attributes.nextMessageTime;
    if (timer > Date.now() / 1000) {
        return true;
    }

    timerResult[0].set("nextMessageTime", Date.now() / 1000 + 3*259200);
    await timerResult[0].save();
    return false;
});

Moralis.Cloud.define("whitelistAdd", async (request) => {
    const logger = Moralis.Cloud.getLogger();
    const userId = request.params.userId;
    let wlQuery = new Moralis.Query("Whitelist");
    wlQuery.equalTo("userId", userId);
    let wlResult = await wlQuery.find({useMasterKey: true});
    if (wlResult.length == 0) {
        let Whitelist = Moralis.Object.extend("Whitelist");
        let newWl = new Whitelist();
        newWl.set("userId", userId);
        await newWl.save(null, {useMasterKey: true});
        return 1;
    }
    return 0;
});

Moralis.Cloud.define("whitelistRemove", async (request) => {
    const logger = Moralis.Cloud.getLogger();
    const userId = request.params.userId;
    let wlQuery = new Moralis.Query("Whitelist");
    wlQuery.equalTo("userId", userId);
    let wlResult = await wlQuery.find({useMasterKey: true});
    if (wlResult.length == 0) {
        return 0;
    }
    wlResult.forEach(async (el) => {
        await el.destroy();
    })
    return 1;
});

Moralis.Cloud.define("whitelistInfo", async (request) => {
    const logger = Moralis.Cloud.getLogger();
    let wlQuery = new Moralis.Query("Whitelist");
    wlQuery.select("userId");
    let allWls = await wlQuery.find({useMasterKey: true});
    let returnArray = [];
    allWls.forEach(el => {
        returnArray.push(el.attributes.userId);
    })
    return returnArray;
});