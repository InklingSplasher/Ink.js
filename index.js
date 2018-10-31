// Setting the config & calling the package
const botconfig = require("./config.json");
const package = require("./package.json")
const Discord = require("discord.js");
const moment = require("moment");
const tz = require("moment-timezone");
const client = new Discord.Client();

// What happens when the bot is started
client.on("ready", async () => {
  console.log(`Logged in as ${client.user.username}...`)
  client.user.setActivity(botconfig.prefix + "help | " + `Serving ${client.guilds.size} guilds!`, { type: 'PLAYING' });
  client.user.setStatus('online');
});

client.on("guildCreate", guild => {
  // This event triggers when the bot joins a guild.
  client.user.setActivity(botconfig.prefix + "help | " + `Serving ${client.guilds.size} guilds!`, { type: 'PLAYING' });
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
});

client.on("guildDelete", guild => {
  // this event triggers when the bot is removed from a guild.
  client.user.setActivity(botconfig.prefix + "help | " + `Serving ${client.guilds.size} guilds!`, { type: 'PLAYING' });
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
});


// Command rules
client.on("message", async message => {
  if(message.author.bot) return; // Checks if command author is the bot iself.
  if(message.channel.type === "dm") return; // Checks if the command is used in DMs.
  if(message.content.indexOf(botconfig.prefix) !== 0) return;

  const args = message.content.slice(botconfig.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  const clean = text => {
  if (typeof(text) === "string")
    return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
  else
      return text;
}

  var invoke = message.content.split(" ")[0].substr(botconfig.prefix.length);
      console.log(invoke, args); // Logging all commands.

  // Variables
  var author = message.author; // The person who sent the message.
  var msg = message.content.toUpperCase(); // Takes a message and makes it all upper-case.
  var cont = message.content; // Raw message content
  var prefix = botconfig.prefix; // The prefix of the bot (stands before every command).
  var guild = msg.guild;
  var channel = msg.channel;
  var chan = message.channel;
  var send = message.channel.send;
  const randomColor = "#"+((1<<24)*Math.random()|0).toString(16)

  if(command === "help") {
    const timestamp = new moment().tz("Europe/Berlin").format('MMMM Do YYYY')
    const embed = new Discord.RichEmbed()
    .setTitle("Help Pages")
    .setDescription("All commands for this bot in a fancy list made of an embed! If you have any questions feel free to ask us in our Discord-Server InkCurity.")
    .setColor(0x1ab7ea)
    .setThumbnail(client.user.avatarURL)
    .setFooter("This bot has been developed by Ink#0001", 'https://cdn.discordapp.com/avatars/223058695100170241/a_ebbefb609630aa6e54cefa0337868fe8.gif')
    .addField("General Commands", "```md\n" + "1. help: Shows this help page!\n2. invite: Shows the link to invite this bot as well as the link for the official server!\n3. stats: Displays general info about me such as my current version.\n4. ping: Displays the current latency to the Discord API and my client." + "```", true)
    .addField("Moderation / Info", "```md\n" + "1. userinfo: Displays general information about a user in the server.\n2. serverinfo: Displays general information about the server.\n3. purge: Deletes a specific number of messages (or 10 if no argument is given)." + "```", true)
    .addField("Miscellaneous", "```md\n" + "1. say: Makes me say stuff and deletes your message.\n2. sayembed: Makes me say stuff, deletes your message and puts your text into a sexy embed!\n3. stealavatar: Steals the avatar URL of the provided user by mention.\n4. poll: Make a poll with the bot!" + "```", true)
    .addField("Bot-Owner", "```md\n" + "1. eval: Evaluates JavaScript.\n2. shutdown: Shuts the bot down.\n3. setstatus: Sets the new status of the bot, for example idle.\n4. setgame: Sets the new playing status of the bot.\n5. send: Sends a message to a specific channel in the server." + "```", true)
    message.channel.send({embed: embed});
  }

  if(command === "ping") {
    const m = await message.channel.send("Ping? <a:Loading:506206198320857099>")
    const embed = new Discord.RichEmbed()
    .setTitle("Pong! :ping_pong:")
    .addField("My Latency:", `${m.createdTimestamp - message.createdTimestamp}ms`, true)
    .addField("API Latency:", `${Math.round(client.ping)}ms`, true)
    .setTimestamp()
    .setColor(0xd35400)
    m.edit({embed: embed});
  }

  if(command === "say") {
    if(args[0] == "bypass") { // For bot owner, to send a message without seeing that say was used.
      if(message.author.id !== botconfig.owner) return;
      const sayMessage = args.slice(1).join(" ") // Reads the message (args) after the say command and puts it into the 'sayMessage' variable.
      message.delete().catch(O_o=>{}) // Deletes the message of the sender.
      message.channel.send(sayMessage); // Sends the given message after the say command.
  } else if(args[0]) {
      const sayMessage = args.join(" ") // Reads the message (args) after the say command and puts it into the 'sayMessage' variable.
      message.delete().catch(O_o=>{}) // Deletes the message of the sender.
      message.channel.send(":information_source: " + sayMessage + " `~" + message.author.tag + "`"); // Sends the given message with the author after the say command.
  }
    else {
      message.delete().catch(O_o=>{})
      message.channel.send("You didn\'t specifiy a text!");
      }
    }

  if(command === "sayembed") {
    message.delete().catch(O_o=>{})
    if(args[0]) {
      if(args[0] == "here") {
        if(message.member.roles.find("name", "Admin") || message.member.roles.find("name", "Administrator") || message.member.roles.find("name", "root")) {
        const sayMessage = args.slice(1).join(" ")
        const embed = new Discord.RichEmbed()
        .setDescription(sayMessage)
        .setAuthor(message.author.tag, message.author.avatarURL)
        .setFooter("Presented by Discord.JS", 'https://inkcurity.net/files/javascript-logo.png')
        .setTimestamp()
        .setColor(0x2ecc71)
        message.channel.send('@here', {embed: embed}); } else return message.reply(":no_entry: **No permissions!** You need one of the following roles: `Admin`, `Administrator`, `root`"); }
      else if(args[0] == "everyone") {
        if(message.member.roles.find("name", "Admin") || message.member.roles.find("name", "Administrator") || message.member.roles.find("name", "root")) {
        const sayMessage = args.slice(1).join(" ")
        const embed = new Discord.RichEmbed()
        .setDescription(sayMessage)
        .setAuthor(message.author.tag, message.author.avatarURL)
        .setFooter("Presented by Discord.JS", 'https://inkcurity.net/files/javascript-logo.png')
        .setTimestamp()
        .setColor(0x2ecc71)
        message.channel.send('@everyone', {embed: embed}); } else return message.reply(":no_entry: **No permissions!** You need one of the following roles: `Admin`, `Administrator`, `root`"); }
      else if(args[0] == "role") {
        if(message.member.roles.find("name", "Admin") || message.member.roles.find("name", "Administrator") || message.member.roles.find("name", "root")) {
        const sayMessage = args.slice(2).join(" ")
        const embed = new Discord.RichEmbed()
        .setDescription(sayMessage)
        .setAuthor(message.author.tag, message.author.avatarURL)
        .setFooter("Presented by Discord.JS", 'https://inkcurity.net/files/javascript-logo.png')
        .setTimestamp()
        .setColor(0x2ecc71)
        message.channel.send('<@&' + args[1] + '>', {embed: embed});
      } else return message.reply(":no_entry: **No permissions!** You need one of the following roles: `Admin`, `Administrator`, `root`");
    } else {
        const sayMessage = args.join(" ")
        const embed = new Discord.RichEmbed()
        .setDescription(sayMessage)
        .setAuthor(message.author.tag, message.author.avatarURL)
        .setFooter("Presented by Discord.JS", 'https://inkcurity.net/files/javascript-logo.png')
        .setTimestamp()
        .setColor(0x2ecc71)
        message.channel.send({embed: embed}); }
      } else {
    message.channel.send("You didn\'t specifiy a text!");
  }}

  if(command === "poll") {
    const poll = args.join(" ")
    message.delete().catch(O_o=>{})
    const embed = new Discord.RichEmbed()
    .setTitle("Suggestion:")
    .setDescription(poll)
    .setFooter(message.author.tag, message.author.avatarURL)
    .setColor(randomColor)
    .setTimestamp()
    const m = await message.channel.send("[**POLL**]\nReact to **one** of the reactions to vote!", {embed: embed})
    m.react('507144037451431949')
    m.react('507144068111925258')
    m.react('507144087057465374')
    return;
  }

  if(command === "stats") {
    const embed = new Discord.RichEmbed()
    .setTitle("General Info & Stats")
    .setDescription("Here, you can find general info as well as some stats about me!")
    .setColor(0x9b59b6)
    .addField("Owner:", "<@!" + botconfig.owner + "> " + "(" + botconfig.ownertag + ")")
    .addField("Version:", package.version, true)
    .addField("Prefix:", botconfig.prefix, true)
    .addField("Currently serving:", client.guilds.size + " guilds!")
    .setAuthor(client.user.tag, client.user.avatarURL)
    .setFooter("Thanks so much for using me!", 'https://cdn.discordapp.com/emojis/466609019050524673.png?v=1')
    .setThumbnail('https://cdn.discordapp.com/avatars/223058695100170241/a_ebbefb609630aa6e54cefa0337868fe8.gif')
    message.channel.send({embed: embed});
  }

  if(command === "invite") {
    const botid = client.user.id
    const embed = new Discord.RichEmbed()
    .setTitle("Invite me, " + client.user.username + "!")
    .setDescription("You can **invite me** using this link: [Click Here](https://discordapp.com/oauth2/authorize?client_id=" + botid + "&scope=bot&permissions=8)")
    .addField("Anything Else?", "Yes, sadly, you can\'t invite me quite yet, because the bot is currently set to \'private\' and can only be invited by my owner Ink#0001.")
    .addField("Requesting Support?", "Feel free to ask us at our official [Discord-Server](http://inkc.me/dis)!")
    .setColor(0xe67e22)
    message.channel.send({embed: embed});
  }

  if(command === "stealavatar") {
    const user = message.mentions.users.first();
    if(user) {
    const embed = new Discord.RichEmbed()
    .setTitle("Avatar of " + user.tag)
    .setDescription("View it [here](" + user.avatarURL + ")!")
    .addField("Raw Link", user.avatarURL)
    .setThumbnail(user.avatarURL)
    .setColor(0x34495e)
    .setAuthor(user.username, user.avatarURL)
    .setFooter("Requested by: " + message.author.tag)
    message.channel.send({embed: embed});
    }
    else {
      message.channel.send("You didn\'t specify a user!")
    }
  }

  if(command === "purge") {
    if(message.member.roles.find("name", "root") || message.member.roles.find("name", "Admin") || message.member.roles.find("name", "Administrator") || message.member.roles.find("name", "Moderator") || message.member.roles.find("name", "Mod")) {
      if(args[0]) {
        message.delete()
        message.channel.bulkDelete(args[0])
        const m = await message.channel.send(":white_check_mark:")
        setTimeout(function(){
        m.delete()
      }, 4000);
    } else {
      message.delete()
      message.channel.bulkDelete('10')
      const m = await message.channel.send(":white_check_mark:")
      setTimeout(function(){
        m.delete()
      }, 4000);
    }
  } else {
    message.reply(':no_entry: **No permissions!** You need one of the following roles: `Mod`, `Moderator`, `Admin`, `Administrator`, `root`');
  }
}

  if(command === "userinfo") {
    const user = message.mentions.users.first()
    if(user) {
      const timestamp = new moment().tz("Europe/Berlin").format('MMMM Do YYYY')
      const joindate = new moment(user.createdAt).tz("Europe/Berlin").format('MMMM Do YYYY, H:mm')
      if(user.presence.game != null) {
      const embed = new Discord.RichEmbed()
      .setTitle("User Information")
      .setDescription("of <@!" + user.id + ">")
      .addField("Username:", user.username, true)
      .addField("Discriminator:", user.discriminator, true)
      .addField("ID:", "`" + user.id + "`", true)
      .addField("Status:", user.presence.status, true)
      .addField("Playing:", user.presence.game.name, true)
      .addField("Joined Discord:", joindate, true)
      .setColor(0x1abc9c)
      .setAuthor(user.tag, user.avatarURL)
      .setFooter("Message sent on: " + timestamp)
      .setThumbnail(user.avatarURL)
      message.channel.send({embed: embed});
    } else {
      const embed = new Discord.RichEmbed()
      .setTitle("User Information")
      .setDescription("of <@!" + user.id + ">")
      .addField("Username:", user.username, true)
      .addField("Discriminator:", user.discriminator, true)
      .addField("ID:", "`" + user.id + "`", true)
      .addField("Status:", user.presence.status, true)
      .addField("Playing:", "Nothing!", true)
      .addField("Joined Discord:", joindate, true)
      .setColor(0x1abc9c)
      .setAuthor(user.tag, user.avatarURL)
      .setFooter("Message sent on: " + timestamp)
      .setThumbnail(user.avatarURL)
      message.channel.send({embed: embed});
    }

  } else {
    const timestamp = new moment().tz("Europe/Berlin").format('MMMM Do YYYY');
    const joindate = new moment(message.author.createdAt).tz("Europe/Berlin").format('MMMM Do YYYY, H:mm');
    if(message.author.game != null) {
    const embed = new Discord.RichEmbed()
    .setTitle("User Information")
    .setDescription("of <@!" + message.author.id + ">")
    .addField("Username:", message.author.username, true)
    .addField("Discriminator:", message.author.discriminator, true)
    .addField("ID:", "`" + message.author.id + "`", true)
    .addField("Status:", message.author.presence.status, true)
    .addField("Playing:", message.author.presence.game.name, true)
    .addField("Joined Discord:", joindate, true)
    .setColor(0x1abc9c)
    .setAuthor(message.author.tag, message.author.avatarURL)
    .setFooter("Message sent on: " + timestamp)
    .setThumbnail(message.author.avatarURL)
    message.channel.send({embed: embed});
  } else {
    const embed = new Discord.RichEmbed()
    .setTitle("User Information")
    .setDescription("of <@!" + message.author.id + ">")
    .addField("Username:", message.author.username, true)
    .addField("Discriminator:", message.author.discriminator, true)
    .addField("ID:", "`" + message.author.id + "`", true)
    .addField("Status:", message.author.presence.status, true)
    .addField("Playing:", "Nothing!", true)
    .addField("Joined Discord:", joindate, true)
    .setColor(0x1abc9c)
    .setAuthor(message.author.tag, message.author.avatarURL)
    .setFooter("Message sent on: " + timestamp)
    .setThumbnail(message.author.avatarURL)
    message.channel.send({embed: embed});
  }
  }
}

  if(command === "serverinfo") {
    var guild = message.guild
    const created = new moment(guild.createdAt).tz("Europe/Berlin").format('MMMM Do YYYY, H:mm')
    const timestamp = new moment().tz("Europe/Berlin").format('MMMM Do YYYY');
    const embed = new Discord.RichEmbed()
    .setTitle("Server Information")
    .setDescription("of " + guild.name + "!")
    .addField("Owner:", "<@!" + guild.owner.id + ">", true)
    .addField("Owner ID:", "`" + guild.owner.id + "`", true)
    .addField("Members:", guild.memberCount, true)
    .addField("Created At:", created, true)
    .addField("Server Region:", guild.region, true)
    .addField("Verification Level:", guild.verificationLevel, true)
    .setFooter("Message sent on: " + timestamp)
    .setColor(0x1abc9c)
    .setThumbnail(guild.iconURL)
    message.channel.send({embed: embed});
  }

  if(command === "eval") {
    if(message.author.id !== botconfig.owner) return;
    message.delete()
    if(args[0]) {
    try {
      const code = args.join(" ");
      let evaled = eval(code);

      if (typeof evaled !== "string")
        evaled = require("util").inspect(evaled);
      const timestamp = new moment().tz("Europe/Berlin").format('MMMM Do YYYY');
      const embed = new Discord.RichEmbed()
      .setTitle("SUCCESS")
      .setDescription("Successfully evaluated your code!")
      .setColor(0x00c300)
      .setAuthor(message.author.tag, message.author.avatarURL)
      .setFooter("Message sent on: " + timestamp)
      .addField("Code Entered:", "```xl\n" + code + "```")
      .addField("Result:", "```xl\n" + clean(evaled) + "```")
      message.channel.send({embed: embed});
    } catch (err) {
      const code = args.join(" ");
      const timestamp = new moment().tz("Europe/Berlin").format('MMMM Do YYYY');
      const embed = new Discord.RichEmbed()
      .setTitle("ERROR")
      .setDescription("Error while evaluating your code!")
      .setColor(0xaf0606)
      .setAuthor(message.author.tag, message.author.avatarURL)
      .setFooter("Message sent on: " + timestamp)
      .addField("Code Entered:", "```xl\n" + code + "```")
      .addField("Result:", "```xl\n" + clean(err) + "```")
      message.channel.send({embed: embed});
    }
  } else {
    message.channel.send("Please **provide a code** to evaluate!")
  }
 }

  if(command === "evalconsole") {
    if(message.author.id !== botconfig.owner) return;
    try {
      const code = args.join(" ");
      let evaled = eval(code);

      if (typeof evaled !== "string")
        evaled = require("util").inspect(evaled);

      message.channel.send("Sent to my console!")
      console.log(clean(evaled));
    } catch (err) {
      console.log("ERROR " + clean(err));
    }
  }

  if(command === "shutdown") {
    if(message.author.id !== botconfig.owner) return;
      const embed = new Discord.RichEmbed()
      .setDescription("**Shutting down..** :sleeping:")
      .setAuthor(message.author.username, message.author.avatarURL)
      .setFooter("Requested by: " + message.author.tag)
      .setColor(0xc0392b)
      message.channel.send({embed: embed})
      setTimeout(function(){ // This is how to make a timeout of 1000ms :)
      client.destroy();
    }, 1000);
  }

  if(command === "setgame") {
    if(message.author.id !== botconfig.owner) return;
      client.user.setActivity(args[1], { type: args[0] })
      const embed = new Discord.RichEmbed()
      .setDescription("The Playing Status has been changed to " + args[0] + " " + args[1])
      .setAuthor(message.author.username, message.author.avatarURL)
      .setFooter("Requested by: " + message.author.tag)
      .setColor(0x27ae60)
      message.channel.send({embed: embed})
      console.log("Bot Activity has been changed to " + args[0] + " " + args[1]);
  }

  if(command === "setstatus") {
    if(message.author.id !== botconfig.owner) return;
      client.user.setStatus(args[0])
      const embed = new Discord.RichEmbed()
      .setDescription("The Bot Status has been changed to " + args[0] + "!")
      .setAuthor(message.author.username, message.author.avatarURL)
      .setFooter("Requested by: " + message.author.tag)
      .setColor(0x27ae60)
      message.channel.send({embed: embed})
      console.log("Bot Status has been changed to " + args[0] + "!");
    }

  if(command === "debug") {
    if(message.author.id !== botconfig.owner) return;
      if(args[0] === "roles") {
        const roles = message.guild.roles.map(r => "\n"+r.id+': '+r.name)
        message.channel.send("```\n" + roles + "```");
      }
    else if(args[0] === "send") {
      if(args[2]) {
        const channelname = args[1]
        const text = args.slice(2).join(" ")
        message.guild.channels.find('name', channelname).send(text)
        message.channel.send(":white_check_mark:");
    } else {
      message.channel.send(":x: Needs a channelname as well as a message!")
    }
      }
    else {
      message.reply("Use one of the following sub-commands: `send`, `roles`")
    }}

});

client.login(botconfig.token);
