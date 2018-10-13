// Setting the config & calling the package
const botconfig = require("./config.json");
const Discord = require("discord.js");
const bot = new Discord.Client();

// What happens when the bot is started
bot.on("ready", async () => {
  console.log(`Logged in as ${bot.user.username}...`);
  bot.user.setGame("with JavaScript code!");
});

// Command rules
bot.on("message", async message => {
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
  var cont = message.content // Raw message content
  var prefix = botconfig.prefix; // The prefix of the bot (stands before every command).
  var guild = msg.guild;
  var channel = msg.channel;


  if(command === "ping"){
    const m = await message.channel.send("Ping?");
    m.edit(`Pong! :ping_pong: \n**My Latency is:** ${m.createdTimestamp - message.createdTimestamp}ms. \n**API Latency is:** ${Math.round(bot.ping)}ms`);
  }

  if(command === "say") {
    const sayMessage = args.join(" "); // Reads the message (args) after the say command and puts it into the 'sayMessage' variable.
    message.delete().catch(O_o=>{}); // Deletes the message of the sender.
    message.channel.send(sayMessage); // Sends the given message after the say command.
  }

  if(command === "eval") {
    if(message.author.id !== botconfig.owner) return;
    try {
      const code = args.join(" ");
      let evaled = eval(code);

      if (typeof evaled !== "string")
        evaled = require("util").inspect(evaled);

      message.channel.send(clean(evaled), {code:"xl"});
    } catch (err) {
      message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
    }
  }

});

bot.login(botconfig.token);
