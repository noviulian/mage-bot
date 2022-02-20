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
