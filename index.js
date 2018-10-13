// Setting the config & calling the package
const botconfig = require("./config.json");
const Discord = require("discord.js");
const bot = new Discord.Client({disableEveryone: true});
const fs = require("fs")

// What happens when the bot is started
bot.on("ready", async () => {
  console.log(`Logged in as ${bot.user.username}...`);
  bot.user.setGame("with JavaScript code!");
});

// Command rules
bot.on("message", async message => {
  if(message.author.bot) return; // Checks if command author is the bot iself.
  if(message.channel.type === "dm") return; // Checks if the command is used in DMs.

// Variables
var author = message.author; // The person who sent the message.
var msg = message.content.toUpperCase(); // Takes a message and makes it all upper-case.
var cont = message.content // Raw message content
var prefix = botconfig.prefix; // The prefix of the bot (stands before every command).
var guild = msg.guild;
var channel = msg.channel;

// Say command
  var invoke = cont.split(" ")[0].substr(botconfig.prefix.length);
  var args = cont.split(" ").slice(1);
  console.log(invoke, args)

  if(msg === prefix + 'PING'){
    message.channel.send("Pong!") // Sends a message to the channel where the command had been used with the content "Pong!".
  }
});

bot.login(botconfig.token);
