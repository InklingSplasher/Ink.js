// Setting the config & calling the package
const botconfig = require("./config.json");
const Discord = require("discord.js");
const bot = new Discord.Client({disableEveryone: true});
const fs = require("fs")

// What happens when the bot is started
bot.on("ready", async () => {
  console.log(`${bot.user.username} is online!`);
  bot.user.setGame("with Javascript code!");
});

// First commands
bot.on("message", async message => {
  if(message.author.bot) return;
  if(message.channel.type === "dm") return;

  let messageArray = message.content.split(" ");
  let cmd = messageArray[0];
  let args = messageArray.slice(1);

    // Variables
    var sender = message.author; // The person who sent the message.
    var msg = message.content.toUpperCase(); // Takes a message and makes it all upper-case.
    var prefix = botconfig.prefix; // The prefix of the bot (stands before every command).


// Ping / Pong Commands
  if(cmd === `${prefix}hello`){
    return message.channel.send("Hello!");
  }

  if(msg === prefix + 'PING'){
    message.channel.send("Pong!") // Sends a message to the channel where the command had been used with the content "Pong!".
  }
});


bot.login(botconfig.token);
