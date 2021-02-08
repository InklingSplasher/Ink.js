// Setting the config & calling the package
const Sentry = require('@sentry/node');
const config = require("./config.json");
const packageInfo = require("./package.json");
const Discord = require("discord.js");
const moment = require("moment");
const tz = require("moment-timezone");
const fs = require("fs");
// noinspection JSCheckFunctionSignatures
const client = new Discord.Client({
    autoReconnect: config.autorestart
});

Sentry.init({ dsn: config.sentryDSN });

// What happens when the bot is started
client.on("ready", async() => {
    console.log(`Logged in as ${client.user.username}...`);
    console.log(`\nSettings:\n\nPrefix: ${config.prefix}\nOwner ID / Tag: ${config.owner} / ${config.ownertag}\nSentryDSN: ${config.sentryDSN}\nAutorestart: ${config.autorestart}\n----------------------------------------\nThanks for using Ink.js!\nI'm ready to receive commands!`);
    client.user.setActivity(config.prefix + "help | " + `Serving ${client.guilds.cache.size} guilds!`, {
        type: 'PLAYING'
    }).catch(e => Sentry.captureException(e));
    client.user.setStatus('online').catch(e => Sentry.captureException(e));
});

client.on("guildCreate", guild => {
    // This event triggers when the bot joins a guild.
    client.user.setActivity(config.prefix + "help | " + `Serving ${client.guilds.cache.size} guilds!`, {
        type: 'PLAYING'
    }).catch(e => Sentry.captureException(e));
    console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
});

client.on("guildDelete", guild => {
    // this event triggers when the bot is removed from a guild.
    client.user.setActivity(config.prefix + "help | " + `Serving ${client.guilds.cache.size} guilds!`, {
        type: 'PLAYING'
    }).catch(e => Sentry.captureException(e));
    console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
});

// Catching eors instead of dying :^)
client.on('uncaughtException', (e) => {
    const eorMsg = e.stack.replace(new RegExp(`${__dirname}/`, 'g'), './');
    console.log('Uncaught Exception: ', eorMsg);
    Sentry.captureException(e);
});

client.on('unhandledRejection', e => {
    console.log('Uncaught Promise Error: ', e);
    Sentry.captureException(e);
});

client.on('eor', e => {
    console.log('Error: ', e);
    Sentry.captureException(e);
});

// Command rules
client.on("message", async message => {
    if (message.author.bot) return; // Checks if command author is the bot itself.
    if (message.channel.type === "dm") return; // Checks if the command is used in DMs.
    if (message.content.indexOf(config.prefix) !== 0) return; // Only accepts commands starting with the right prefix
    if (isIDInBlacklist(message.author.id)) return message.channel.send("You are blacklisted!").catch( e => Sentry.captureException(e)); // Checks if the user is blacklisted

    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    const clean = text => {
        if (typeof(text) === "string")
            return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
        else
            return text;
    };

    let invoke = message.content.split(" ")[0].substr(config.prefix.length);

    function sum(input) {

        if (toString.call(input) !== "[object Array]")
            return false;

        var total = 0;
        for (var i = 0; i < input.length; i++) {
            if (isNaN(input[i])) {
                continue;
            }
            total += Number(input[i]);
        }
        return total;
    }

    function removeFromBlacklist(id) {
        const blacklistFile = './blacklist.json';

        fs.readFile(blacklistFile, function(e, data) {
            var contentToJSON = JSON.parse(data);
            var idIndex = contentToJSON.indexOf(id);

            contentToJSON.splice(idIndex, 1);

            fs.writeFile(blacklistFile, JSON.stringify(contentToJSON), function(e) {
                if (e) return console.log(e);
            });
        });
    }

    function isIDInBlacklist(id) {
        //  Get the blacklist file.
        const blacklistFile = './blacklist.json';

        //  Here we open and read the JSON file's contents synchronously.
        var data = fs.readFileSync(blacklistFile, 'utf-8');

        //  We are reading the blacklist file as a string, but in order
        //  to do stuff to it, we need to parse it into a JSON object
        //  first.
        var contentToJSON = JSON.parse(data);

        //  Returns if the given ID is inside or not.
        return contentToJSON.includes(id);
    }

    console.log(message.author.tag, `(${message.author.id})`, invoke, args); // Logging all commands.

    Sentry.init({
        dsn: config.sentryDSN,
        release: `inkjs@${packageInfo.version}`,
        tags: {
            service: 'discord'
        },
        user: {
            name: message.author.tag,
            id: message.author.id,
            guild: message.guild.id
        }
    });

    // Variables
    // let author = message.author; // The person who sent the message.
    // let msg = message.content.toUpperCase(); // Takes a message and makes it all upper-case.
    // let cont = message.content; // Raw message content
    let prefix = config.prefix; // The prefix of the bot (stands before every command).
    // let channel = msg.channel;
    // let chan = message.channel;
    // let send = message.channel.send;
    const randomColor = "#" + ((1 << 24) * Math.random() | 0).toString(16);

    if (command === "help" || command === "commands") {
        const embed = new Discord.MessageEmbed()
            .setTitle("Help Pages")
            .setDescription("All commands for this bot in a fancy list made of an embed! If you have any questions feel free to ask us in our Discord-Server InkCurity.")
            .setColor(0x1ab7ea)
            .setThumbnail(client.user.avatarURL)
            .setTimestamp()
            .setFooter("This bot has been developed by Ink#0001", 'https://cdn.discordapp.com/avatars/223058695100170241/a_ebbefb609630aa6e54cefa0337868fe8.gif')
            .addField("General Commands", "```md\n" + "1. help: Shows this help page!\n2. invite: Shows the link to invite this bot as well as the link for the official server!\n3. stats: Displays general info about me such as my current version.\n4. ping: Displays the current latency to the Discord API and my client." + "```", true)
            .addField("Moderation / Info", "```md\n" + "1. purge: Deletes a specific number of messages (or 10 if no argument is given).\n2. kick: Kicks a specific member with the given reason.\n3. ban: Bans a specific member with the given reason.\n4. role: Assign or remove a user from a role." + "```", true)
            .addField("Utility", "```md\n" + "1. userinfo: Displays general information about a user in the server.\n2. serverinfo: Displays general information about the server." + "```", true)
            .addField("Miscellaneous", "```md\n" + "1. say: Makes me say stuff and deletes your message.\n2. sayembed: Makes me say stuff, deletes your message and puts your text into a sexy embed!\n3. stealavatar: Steals the avatar URL of the provided user by mention.\n4. poll: Make a poll with the bot!\n5. notify: Makes the bot send a role-ping to a specific channel.\n6. math: Summarize multple values and find an average." + "```", true)
            .addField("Bot-Owner", "```md\n" + "1. eval: Evaluates JavaScript.\n2. evalconsole: Evaluates JavaScript and prints it into the console.\n3. shutdown: Shuts the bot down.\n4. debug: Some secret, useful commands for the owner.\n5. blacklist: Add or remove people from the bot blacklist." + "```", true);
        message.channel.send({
            embed: embed
        }).catch(e => Sentry.captureException(e));
    }

    if (command === "ping" || command === "hello") {
        const m = await message.channel.send("Ping? ");
        const embed = new Discord.MessageEmbed()
            .setTitle("Pong! :ping_pong:")
            .addField("My Latency:", `${m.createdTimestamp - message.createdTimestamp}ms`, true)
            .addField("API Latency:", `${Math.round(client.ws.ping)}ms`, true)
            .setTimestamp()
            .setColor(0xd35400);
        await m.edit({
            embed: embed
        }).catch(e => Sentry.captureException(e));
    }

    if (command === "say") {
        if (message.member.hasPermission('MANAGE_MESSAGES')) {
            if (args[0] === "bypass") { // For bot owner, to send a message without seeing that say was used.
                if (message.author.id !== config.owner) message.reply("Not a bot owner!").catch(e => Sentry.captureException(e));
                const sayMessage = args.slice(1).join(" "); // Reads the message (args) after the say command and puts it into the 'sayMessage' variable.
                message.delete().catch(O_o => {}); // Deletes the message of the sender.
                message.channel.send(sayMessage).catch(e => Sentry.captureException(e)); // Sends the given message after the say command.
            } else if (args[0]) {
                const sayMessage = args.join(" ");
                message.delete().catch(O_o => {});
                message.channel.send(clean(":information_source: " + sayMessage + " `~" + message.author.tag + "`")).catch(e => Sentry.captureException(e)); // Sends the given message with the author after the say command.
            } else {
                const embed = new Discord.MessageEmbed() // Typical form eor
                    .setTitle("Command: say")
                    .addField("Usage", "`" + config.prefix + "say <message>`")
                    .setAuthor(message.author.username, message.author.avatarURL())
                    .setColor(0xe74c3c);
                message.channel.send({
                    embed: embed
                }).catch(e => Sentry.captureException(e));
            }
        } else {
            const embed = new Discord.MessageEmbed() // Typical perm eor
                .setTitle("Permission err!")
                .setDescription("You don't have the permission to use this command! <:NoShield:500245155266166784>\nMissing: `MANAGE_MESSAGES`")
                .setAuthor(message.author.username, message.author.avatarURL())
                .setColor(0xe74c3c);
            message.channel.send({
                embed: embed
            }).catch(e => Sentry.captureException(e));
        }
    }

    if (command === "sayembed" || command === "embed") {
        if (message.member.hasPermission('EMBED_LINKS')) {
            if (args[0]) {
                if (args[0] === "here") {
                    if (message.member.hasPermission('MENTION_EVERYONE')) {
                        message.delete().catch(O_o => {});
                        const sayMessage = args.slice(1).join(" ");
                        const embed = new Discord.MessageEmbed()
                            .setDescription(sayMessage)
                            .setAuthor(message.author.tag, message.author.avatarURL())
                            .setTimestamp()
                            .setColor(randomColor);
                        message.channel.send('@here', {
                            embed: embed
                        }).catch(e => Sentry.captureException(e));
                    } else {
                        const embed = new Discord.MessageEmbed() // Typical perm eor
                            .setTitle("Permission eor!")
                            .setDescription("You don't have the permission to use this command! <:NoShield:500245155266166784>\nMissing: `MENTION_EVERYONE`")
                            .setAuthor(message.author.tag, message.author.avatarURL())
                            .setColor(0xe74c3c);
                        message.channel.send({
                            embed: embed
                        }).catch(e => Sentry.captureException(e));
                    }
                } else if (args[0] === "everyone") {
                    if (message.member.hasPermission('MENTION_EVERYONE')) {
                        message.delete().catch(O_o => {});
                        const sayMessage = args.slice(1).join(" ");
                        const embed = new Discord.MessageEmbed()
                            .setDescription(sayMessage)
                            .setAuthor(message.author.tag, message.author.avatarURL())
                            .setTimestamp()
                            .setColor(randomColor);
                        message.channel.send('@everyone', {
                            embed: embed
                        }).catch(e => Sentry.captureException(e));
                    } else {
                        const embed = new Discord.MessageEmbed() // Typical perm eor
                            .setTitle("Permission eor!")
                            .setDescription("You don't have the permission to use this command! <:NoShield:500245155266166784>\nMissing: `MENTION_EVERYONE`")
                            .setAuthor(message.author.tag, message.author.avatarURL())
                            .setColor(0xe74c3c);
                        message.channel.send({
                            embed: embed
                        }).catch(e => Sentry.captureException(e));
                    }
                } else if (args[0] === "role") {
                    if (message.member.hasPermission('MENTION_EVERYONE')) {
                        message.delete().catch(O_o => {});
                        const sayMessage = args.slice(2).join(" ");
                        const embed = new Discord.MessageEmbed()
                            .setDescription(sayMessage)
                            .setAuthor(message.author.tag, message.author.avatarURL())
                            .setTimestamp()
                            .setColor(randomColor);
                        message.channel.send('<@&' + args[1] + '>', {
                            embed: embed
                        }).catch(e => Sentry.captureException(e));
                    } else {
                        const embed = new Discord.MessageEmbed() // Typical perm eor
                            .setTitle("Permission eor!")
                            .setDescription("You don't have the permission to use this command! <:NoShield:500245155266166784>\nMissing: `MENTION_EVERYONE`")
                            .setAuthor(message.author.tag, message.author.avatarURL())
                            .setColor(0xe74c3c);
                        message.channel.send({
                            embed: embed
                        }).catch(e => Sentry.captureException(e));
                    }
                } else if (args[0] === "custom") {
                    if (message.member.hasPermission('MENTION_EVERYONE')) {
                        if (args[3]) {
                            message.delete().catch(O_o => {});
                            const color = args[1];
                            const description = args.slice(3).join(" ");
                            const embed = new Discord.MessageEmbed()
                                .setAuthor(message.author.tag, message.author.avatarURL())
                                .setTimestamp()
                                .setTitle(args[2])
                                .setDescription(description)
                                .setColor(color);
                            message.channel.send({
                                embed: embed
                            }).catch(e => Sentry.captureException(e));
                        } else {
                            message.channel.send("Invalid arguments!").catch(e => Sentry.captureException(e));
                        }
                    } else {
                        const embed = new Discord.MessageEmbed() // Typical perm eor
                            .setTitle("Permission eor!")
                            .setDescription("You don't have the permission to use this command! <:NoShield:500245155266166784>\nMissing: `MENTION_EVERYONE`")
                            .setAuthor(message.author.tag, message.author.avatarURL())
                            .setColor(0xe74c3c);
                        message.channel.send({
                            embed: embed
                        }).catch(e => Sentry.captureException(e));
                    }
                } else {
                    message.delete().catch(O_o => {});
                    const sayMessage = args.join(" ");
                    const embed = new Discord.MessageEmbed()
                        .setDescription(sayMessage)
                        .setAuthor(message.author.tag, message.author.avatarURL())
                        .setTimestamp()
                        .setColor(randomColor);
                    message.channel.send({
                        embed: embed
                    }).catch(e => Sentry.captureException(e));
                }
            } else {
                const embed = new Discord.MessageEmbed() // Typical form eor
                    .setTitle("Command: embed")
                    .setDescription("Creates an embed, and if wanted, pings a specific role. \nThe embed author is the command issuer.")
                    .addField("Usage", "```md\n" + config.prefix + "embed [everyone/here] <message>\n" + config.prefix + "embed role <roleID> <message>\n" + config.prefix + "embed custom <color> <title> <desc>```", true)
                    .addField("Permissions required:", "`EMBED_LINKS`\n`MENTION_EVERYONE`", true)
                    .setAuthor(message.author.username, message.author.avatarURL())
                    .setColor(0xe74c3c);
                message.channel.send({
                    embed: embed
                }).catch(e => Sentry.captureException(e));
            }
        } else {
            const embed = new Discord.MessageEmbed() // Typical perm eor
                .setTitle("Permission eor!")
                .setDescription("You don't have the permission to use this command! <:NoShield:500245155266166784>\nMissing: `EMBED_LINKS`")
                .setAuthor(message.author.username, message.author.avatarURL())
                .setColor(0xe74c3c);
            message.channel.send({
                embed: embed
            }).catch(e => Sentry.captureException(e));
        }
    }
    if (command === "poll") {
        if (message.member.hasPermission('MANAGE_MESSAGES')) {
            const poll = args.join(" ");
            if (poll) {
                message.delete().catch(O_o => {});
                const embed = new Discord.MessageEmbed()
                    .setTitle("Poll:")
                    .setDescription(poll)
                    .setFooter(message.author.tag, message.author.avatarURL())
                    .setColor(randomColor)
                    .setTimestamp();
                const m = await message.channel.send("[**POLL**]\nReact to **one** of the reactions to vote!", {
                    embed: embed
                }).catch(e => Sentry.captureException(e));
                m.react('507144037451431949').catch(e => Sentry.captureException(e));
                m.react('507144068111925258').catch(e => Sentry.captureException(e));
                m.react('507144087057465374').catch(e => Sentry.captureException(e));
                return;
            } else {
                const embed = new Discord.MessageEmbed() // Typical form eor
                    .setTitle("Command: poll")
                    .setDescription("Creates a poll for people to vote on.")
                    .addField("Usage", "```md\n" + config.prefix + "poll <question>```", true)
                    .addField("Permissions required:", "`MANAGE_MESSAGES`", true)
                    .setAuthor(message.author.username, message.author.avatarURL())
                    .setColor(0xe74c3c);
                message.channel.send({
                    embed: embed
                }).catch(e => Sentry.captureException(e));
            }
        } else {
            const embed = new Discord.MessageEmbed() // Typical perm eor
                .setTitle("Permission eor!")
                .setDescription("You don't have the permission to use this command! <:NoShield:500245155266166784>\nMissing: `EMBED_LINKS`")
                .setAuthor(message.author.username, message.author.avatarURL())
                .setColor(0xe74c3c);
            message.channel.send({
                embed: embed
            }).catch(e => Sentry.captureException(e));
        }
    }

    if (command === "stats") {
        let count = Array.from(client.users.cache);
        const embed = new Discord.MessageEmbed()
            .setTitle("General Info & Stats")
            .setDescription("Here, you can find general info as well as some stats about me!")
            .setColor(0x9b59b6)
            .addField("Owner:", "<@!" + config.owner + "> " + "(" + config.ownertag + ")", true)
            .addField("Version:", packageInfo.version, true)
            .addField("Source:", "[View on GitHub](https://github.com/InklingSplasher/Ink.js)", true)
            .addField("Prefix:", prefix, true)
            .addField("(Inaccurate) Total Users:", count.length, true)
            .addField("General Stats:", client.guilds.cache.size + " Guilds\n" + client.users.cache.size + " Users", true)
            .setAuthor(client.user.tag, client.user.avatarURL())
            .setFooter("Thanks so much for using me!", 'https://cdn.discordapp.com/emojis/466609019050524673.png?v=1')
            .setThumbnail('https://cdn.discordapp.com/avatars/223058695100170241/a_ebbefb609630aa6e54cefa0337868fe8.gif');
        message.channel.send({
            embed: embed
        }).catch(e => Sentry.captureException(e));
    }

    if (command === "invite") {
        const botID = client.user.id;
        const embed = new Discord.MessageEmbed()
            .setTitle("Invite me, " + client.user.username + "!")
            .setDescription("You can **invite me** using this link: [Click Here](https://discordapp.com/oauth2/authorize?client_id=" + botID + "&scope=bot&permissions=8)")
            .addField("Anything Else?", "Yes, sadly, you can\'t invite me quite yet, because the bot is currently set to \'private\' and can only be invited by my owner Ink#0001.")
            .addField("Requesting Support?", "Feel free to ask us at our official [Discord-Server](http://inkc.me/dis)!")
            .setColor(0xe67e22);
        message.channel.send({
            embed: embed
        }).catch(e => Sentry.captureException(e));
    }

    if (command === "stealavatar" || command === "avatar") {
        const user = message.mentions.users.first();
        if (user) {
            const embed = new Discord.MessageEmbed()
                .setTitle("Avatar of " + user.tag)
                .setDescription("View it [here](" + user.avatarURL() + ")!")
                .addField("Raw Link", user.avatarURL())
                .setThumbnail(user.avatarURL())
                .setColor(0x34495e)
                .setAuthor(user.username, user.avatarURL())
                .setFooter("Requested by: " + message.author.tag);
            message.channel.send({
                embed: embed
            }).catch(e => Sentry.captureException(e));
        } else {
            const embed = new Discord.MessageEmbed() // Typical form eor
                .setTitle("Command: avatar")
                .setDescription("Steals an avatar from a mentioned user.")
                .addField("Usage", "```md\n" + config.prefix + "avatar <mention>```", true)
                .addField("Permissions required:", "NONE", true)
                .setAuthor(message.author.username, message.author.avatarURL())
                .setColor(0xe74c3c);
            message.channel.send({
                embed: embed
            }).catch(e => Sentry.captureException(e));
        }
    }

    if (command === "purge" || command === "clean") {
        asend = true;
        if (message.member.hasPermission('MANAGE_MESSAGES')) {
            if (args[0]) {
                var rawamount = args.map(function(x) {
                    return amount = parseInt(x, 10);
                });
                var amount = amount + 1;

                const timestamp = new moment().tz("Europe/Berlin").format('MMMM Do YYYY');
                await message.channel.bulkDelete(amount, true).catch(e => {
                    Sentry.captureException(e);
                    const errembed = new Discord.MessageEmbed()
                        .setTitle("ERROR")
                        .setDescription("Error while evaluating your code!")
                        .setColor(0xaf0606)
                        .setAuthor(message.author.tag, message.author.avatarURL())
                        .setFooter("Message sent on: " + timestamp)
                        .addField("Reason", e);
                    message.channel.send(errembed);
                    asend = false;
                });
                if(await asend === true) {
                    const m = await message.channel.send(":white_check_mark:").catch(e => Sentry.captureException(e));
                    setTimeout(function() {
                        m.delete();
                    }, 4000);
                }
            } else {
                asend = true;
                message.delete().catch(e => Sentry.captureException(e));
                await message.channel.bulkDelete('11', true).catch(e => {
                    Sentry.captureException(e);
                    const errembed = new Discord.MessageEmbed()
                        .setTitle("ERROR")
                        .setDescription("Error while evaluating your code!")
                        .setColor(0xaf0606)
                        .setAuthor(message.author.tag, message.author.avatarURL())
                        .setFooter("Message sent on: " + timestamp)
                        .addField("Reason", e);
                    message.channel.send(errembed);
                    asend = false;
                });
                if(await asend === "true") {
                    const m = await message.channel.send(":white_check_mark:").catch(e => Sentry.captureException(e));
                    setTimeout(function() {
                        m.delete();
                    }, 4000);
                }
            }
        } else {
            const embed = new Discord.MessageEmbed() // Typical perm eor
                .setTitle("Permission eor!")
                .setDescription("You don't have the permission to use this command! <:NoShield:500245155266166784>\nMissing: `MANAGE_MESSAGES`")
                .setAuthor(message.author.username, message.author.avatarURL())
                .setColor(0xe74c3c);
            message.channel.send({
                embed: embed
            }).catch(e => Sentry.captureException(e));
        }
    }

    if (command === "kick") {
        if (message.member.hasPermission('KICK_MEMBERS')) {
            const user = message.mentions.users.first();
            if (user) {
                const member = message.guild.member(user);
                if (member) {
                    if (member.kickable === true) {
                        const reason = args[1];
                        member.kick(reason).catch(e => Sentry.captureException(e));
                        message.react('526078701830406173').catch(e => Sentry.captureException(e));
                    } else {
                        const embed = new Discord.MessageEmbed() // Bot perm eor
                            .setTitle("Permission eor!")
                            .setDescription("I don't have the permission to kick this user! <:NoShield:500245155266166784>")
                            .setAuthor(message.author.username, message.author.avatarURL())
                            .setColor(0xe74c3c);
                        message.channel.send({
                            embed: embed
                        }).catch(e => Sentry.captureException(e));
                    }
                }
            } else {
                const embed = new Discord.MessageEmbed() // Typical form eor
                    .setTitle("Command: kick")
                    .setDescription("Kicks a specified user from the guild.")
                    .addField("Usage", "```md\n" + config.prefix + "kick <mention> [reason]```", true)
                    .addField("Permissions required:", "`KICK_MEMBERS`", true)
                    .setAuthor(message.author.username, message.author.avatarURL())
                    .setColor(0xe74c3c);
                message.channel.send({
                    embed: embed
                }).catch(e => Sentry.captureException(e));
            }
        } else {
            const embed = new Discord.MessageEmbed() // Typical perm eor
                .setTitle("Permission eor!")
                .setDescription("You don't have the permission to use this command! <:NoShield:500245155266166784>\nMissing: `EMBED_LINKS`")
                .setAuthor(message.author.username, message.author.avatarURL())
                .setColor(0xe74c3c);
            message.channel.send({
                embed: embed
            }).catch(e => Sentry.captureException(e));
        }
    }

    if (command === "ban") {
        if (message.member.hasPermission('BAN_MEMBERS')) {
            const user = message.mentions.users.first();
            if (user) {
                const member = message.guild.member(user);
                if (member) {
                    if (member.bannable === true) {
                        const reason = args[1];
                        member.ban(reason).catch(e => Sentry.captureException(e));
                        message.react('526078701830406173').catch(e => Sentry.captureException(e));
                    } else {
                        const embed = new Discord.MessageEmbed() // Bot perm eor
                            .setTitle("Permission eor!")
                            .setDescription("I don't have the permission to ban this user! <:NoShield:500245155266166784>")
                            .setAuthor(message.author.username, message.author.avatarURL())
                            .setColor(0xe74c3c);
                        message.channel.send({
                            embed: embed
                        }).catch(e => Sentry.captureException(e));
                    }
                }
            } else {
                const embed = new Discord.MessageEmbed() // Typical form eor
                    .setTitle("Command: ban")
                    .setDescription("Bans a specified user from the guild.")
                    .addField("Usage", "```md\n" + config.prefix + "ban <mention> [reason]```", true)
                    .addField("Permissions required:", "`BAN_MEMBERS`", true)
                    .setAuthor(message.author.username, message.author.avatarURL())
                    .setColor(0xe74c3c);
                message.channel.send({
                    embed: embed
                }).catch(e => Sentry.captureException(e));
            }
        } else {
            const embed = new Discord.MessageEmbed() // Typical perm eor
                .setTitle("Permission eor!")
                .setDescription("You don't have the permission to use this command! <:NoShield:500245155266166784>\nMissing: `EMBED_LINKS`")
                .setAuthor(message.author.username, message.author.avatarURL())
                .setColor(0xe74c3c);
            message.channel.send({
                embed: embed
            }).catch(e => Sentry.captureException(e));
        }
    }

    if (command === "role") {
        const user = message.mentions.users.first();
        const role = message.guild.roles.cache.find(r => r.name === args.slice(2).join(" "));

        if (args[0] === "add") {
            if (message.member.hasPermission('MANAGE_ROLES') && message.member.roles.highest.position > role.position) {
                if (user) {
                    const member = message.guild.member(user);
                    member.roles.add(role.id, `Role Change by ${message.author.tag}`).catch(e => Sentry.captureException(e));
                    const embed = new Discord.MessageEmbed()
                        .setTitle("Successful!")
                        .setDescription(`Role **${role.name}** has been added to the member **${member}** successfully!`)
                        .setColor(0x27ae60)
                        .setTimestamp();
                    message.channel.send({
                        embed: embed
                    }).catch(e => Sentry.captureException(e));
                }
            } else {
                const embed = new Discord.MessageEmbed() // Typical perm eor
                    .setTitle("Permission eor!")
                    .setDescription("You don't have the permission to use this command! <:NoShield:500245155266166784>\nMissing: `MANAGE_ROLES` \n\n**OR** Your highest role is not over the role you are trying to assign.")
                    .setAuthor(message.author.username, message.author.avatarURL())
                    .setColor(0xe74c3c);
                message.channel.send({
                    embed: embed
                }).catch(e => Sentry.captureException(e));
            }
        } else if (args[0] === "remove" || args[0] === "rem") {
            if (message.member.hasPermission('MANAGE_ROLES') && message.member.roles.highest.position > role.position) {
                if (user) {
                    const member = message.guild.member(user);
                    member.roles.remove(role.id, `Role Change by ${message.author.tag}`).catch(e => Sentry.captureException(e));
                    const embed = new Discord.MessageEmbed()
                        .setTitle("Successful!")
                        .setDescription(`Role **${role.name}** has been removed from the member **${member}** successfully!`)
                        .setColor(0x27ae60)
                        .setTimestamp();
                    message.channel.send({
                        embed: embed
                    }).catch(e => Sentry.captureException(e));
                }
            } else {
                const embed = new Discord.MessageEmbed() // Typical perm eor
                    .setTitle("Permission eor!")
                    .setDescription("You don't have the permission to use this command! <:NoShield:500245155266166784>\nMissing: `MANAGE_ROLES` \n\n**OR** Your highest role is not over the role you are trying to remove.")
                    .setAuthor(message.author.username, message.author.avatarURL())
                    .setColor(0xe74c3c);
                message.channel.send({
                    embed: embed
                }).catch(e => Sentry.captureException(e));
            }
        } else {
            const embed = new Discord.MessageEmbed() // Typical form eor
                .setTitle("Command: role")
                .setDescription("Add or remove people to specified roles.")
                .addField("Usage", "```md\n" + config.prefix + "role add <mention> <rolename>\n" + config.prefix + "role remove <mention> <rolename>```", true)
                .addField("Permissions required:", "`MANAGE_ROLES`", true)
                .setAuthor(message.author.username, message.author.avatarURL())
                .setColor(0xe74c3c);
            message.channel.send({
                embed: embed
            }).catch(e => Sentry.captureException(e));
        }
    }

    if (command === "notify" || command === "tempmention") {
        if (args[1]) {
            if (message.member.hasPermission('MENTION_EVERYONE')) {
                const channel1 = args[0];
                const role = message.guild.roles.cache.find(r => r.name === args[1]);
                const text = `[<@&${role.id}>] Notification!`;
                role.setMentionable(true, `Tempmention called by ${message.author.tag}`).catch(e => {
                    message.channel.send("I don't have permissions to edit this role!").catch(e => Sentry.captureException(e));
                });
                message.guild.channels.cache.find(channel => channel.name === channel1).send(text).catch(e => {
                    message.channel.send("I don't have the permissions to send messages into this channel!").catch(e => Sentry.captureException(e));
                });
                role.setMentionable(false).catch(e => Sentry.captureException(e));
                message.react('526078701830406173').catch(e => Sentry.captureException(e));
            } else {
                const embed = new Discord.MessageEmbed() // Typical perm eor
                    .setTitle("Permission eor!")
                    .setDescription("You don't have the permission to use this command! <:NoShield:500245155266166784>\nMissing: `MENTION_EVERYONE`")
                    .setAuthor(message.author.username, message.author.avatarURL())
                    .setColor(0xe74c3c);
                message.channel.send({
                    embed: embed
                }).catch(e => Sentry.captureException(e));
            }
        } else {
            const embed = new Discord.MessageEmbed() // Typical form eor
                .setTitle("Command: notify")
                .setDescription("Sends a message containing a ping with the specified role into a specified channel.")
                .addField("Usage", "```md\n" + config.prefix + "notify <channelname> <rolename>```", true)
                .addField("Permissions required:", "`MENTION_EVERYONE`", true)
                .setAuthor(message.author.username, message.author.avatarURL())
                .setColor(0xe74c3c);
            message.channel.send({
                embed: embed
            }).catch(e => Sentry.captureException(e));
        }
    }

    if (command === "userinfo" || command === "user" || command === "whois") {
        const user = message.mentions.users.first() || message.author;
        var emote = null;
        switch (user.presence.status) {
            case 'online':
            {
                emote = '<:online:572804498850971648>';
                break;
            }
            case 'offline':
            {
                emote = '<:offline:572804497655726106>';
                break;
            }
            case 'idle':
            {
                emote = '<:idle:572804498469421066>';
                break;
            }
            case 'dnd':
            {
                emote = '<:dnd:572804497928093696>';
                break;
            }
            default:
                console.log('Error');
        }
        const timestamp = new moment().tz("Europe/Berlin").format('MMMM Do YYYY');
        const joindate = new moment(user.createdAt).tz("Europe/Berlin").format('MMMM Do YYYY, H:mm');
        if (user.presence.activities !== null) {
            const embed = new Discord.MessageEmbed()
                .setTitle("User Information")
                .setDescription("of <@!" + user.id + "> " + emote)
                .addField("Username:", user.username, true)
                .addField("Discriminator:", user.discriminator, true)
                .addField("ID:", "`" + user.id + "`", true)
                .addField("Status:", user.presence.status, true)
                .addField("Playing:", user.presence.activities, true)
                .addField("Joined Discord:", joindate, true)
                .setColor(0x1abc9c)
                .setAuthor(user.tag, user.avatarURL())
                .setFooter("Message sent on: " + timestamp)
                .setThumbnail(user.avatarURL());
            message.channel.send({
                embed: embed
            }).catch(e => Sentry.captureException(e));
        } else {
            const embed = new Discord.MessageEmbed()
                .setTitle("User Information")
                .setDescription("of <@!" + user.id + "> " + emote)
                .addField("Username:", user.username, true)
                .addField("Discriminator:", user.discriminator, true)
                .addField("ID:", "`" + user.id + "`", true)
                .addField("Status:", user.presence.status, true)
                .addField("Playing:", "Nothing!", true)
                .addField("Joined Discord:", joindate, true)
                .setColor(0x1abc9c)
                .setAuthor(user.tag, user.avatarURL())
                .setFooter("Message sent on: " + timestamp)
                .setThumbnail(user.avatarURL());
            message.channel.send({
                embed: embed
            }).catch(e => Sentry.captureException(e));
        }
    }

    if (command === "serverinfo" || command === "server" || command === "guildinfo") {
        let guild = message.guild;
        const created = new moment(guild.createdAt).tz("Europe/Berlin").format('MMMM Do YYYY, H:mm');
        const timestamp = new moment().tz("Europe/Berlin").format('MMMM Do YYYY');
        const embed = new Discord.MessageEmbed()
            .setTitle("Server Information")
            .setDescription("of " + guild.name + "!")
            .addField("Owner:", "<@!" + guild.ownerID + ">", true)
            .addField("Owner ID:", "`" + guild.ownerID + "`", true)
            .addField("Members:", guild.memberCount, true)
            .addField("Created At:", created, true)
            .addField("Server Region:", guild.region, true)
            .addField("Verification Level:", guild.verificationLevel, true)
            .setFooter("Message sent on: " + timestamp)
            .setColor(0x1abc9c)
            .setThumbnail(guild.iconURL());
        message.channel.send({
            embed: embed
        }).catch(e => Sentry.captureException(e));
    }

    if (command === "eval") {
        if (message.author.id !== config.owner) return;
        if (args[0]) {
            try {
                const code = args.join(" ");
                let evaled = eval(code);

                if (typeof evaled !== "string")
                    evaled = require("util").inspect(evaled);
                const timestamp = new moment().tz("Europe/Berlin").format('MMMM Do YYYY');
                const embed = new Discord.MessageEmbed()
                    .setTitle("SUCCESS")
                    .setDescription("Successfully evaluated your code!")
                    .setColor(0x00c300)
                    .setAuthor(message.author.tag, message.author.avatarURL())
                    .setFooter("Message sent on: " + timestamp)
                    .addField("Code Entered:", "```xl\n" + code + "```")
                    .addField("Result:", "```xl\n" + clean(evaled) + "```");
                message.channel.send({
                    embed: embed
                }).catch(e => Sentry.captureException(e));
            } catch (e) {
                const code = args.join(" ");
                const timestamp = new moment().tz("Europe/Berlin").format('MMMM Do YYYY');
                const embed = new Discord.MessageEmbed()
                    .setTitle("ERROR")
                    .setDescription("Error while evaluating your code!")
                    .setColor(0xaf0606)
                    .setAuthor(message.author.tag, message.author.avatarURL())
                    .setFooter("Message sent on: " + timestamp)
                    .addField("Code Entered:", "```xl\n" + code + "```")
                    .addField("Result:", "```xl\n" + clean(e) + "```");
                message.channel.send({
                    embed: embed
                }).catch(e => Sentry.captureException(e));
            }
        } else {
            const embed = new Discord.MessageEmbed() // Typical form eor
                .setTitle("Command: eval")
                .setDescription("Evaluates JavaScript.\n**USE WITH EXTREME CAUTION!**")
                .addField("Usage", "```md\n" + config.prefix + "eval <code>```", true)
                .addField("Permissions required:", "`BOT_OWNER`", true)
                .setAuthor(message.author.username, message.author.avatarURL())
                .setColor(0xe74c3c);
            message.channel.send({
                embed: embed
            }).catch(e => Sentry.captureException(e));
        }
    }

    if (command === "evalconsole") {
        if (message.author.id !== config.owner) return;
        try {
            const code = args.join(" ");
            let evaled = eval(code);

            if (typeof evaled !== "string")
                evaled = require("util").inspect(evaled);

            message.channel.send("Sent to my console!").catch(e => Sentry.captureException(e));
            console.log(clean(evaled));
        } catch (e) {
            console.log("ERROR " + clean(e));
        }
    }

    if (command === "blacklist" || command === "bl") {
        if (message.author.id !== config.owner) return;
        const user = args[1];
        if (args[0] === "add") {
            var blacklistDirectory = './blacklist.json';

            fs.readFile(blacklistDirectory, function(e, data) {
                var contentToJSON = JSON.parse(data);

                contentToJSON.push(user);

                fs.writeFile(blacklistDirectory, JSON.stringify(contentToJSON), function(e) {
                    if (e) return console.log(e);
                });
                message.channel.send(`Successfully blacklisted user **${user}**!`).catch(e => Sentry.captureException(e));
            });
        } else if (args[0] === "remove") {
            removeFromBlacklist(args[1]);
            message.channel.send(`Successfully un-blacklisted user **${args[1]}**!`).catch(e => Sentry.captureException(e));
        } else {
            const embed = new Discord.MessageEmbed() // Typical form eor
                .setTitle("Command: blacklist")
                .setDescription("Blocks / unblock people from the bot by blacklisting / un-blacklisting them.")
                .addField("Usage", "```md\n" + config.prefix + "blacklist add <ID>\n" + config.prefix + "blacklist remove <ID>```", true)
                .addField("Permissions required:", "`BOT_OWNER`", true)
                .setAuthor(message.author.username, message.author.avatarURL())
                .setColor(0xe74c3c);
             message.channel.send({
                embed: embed
            }).catch(e => Sentry.captureException(e));
        }
    }

    if (command === "shutdown") {
        if (message.author.id !== config.owner) return;
        const embed = new Discord.MessageEmbed()
            .setDescription("**Shutting down..** :sleeping:")
            .setAuthor(message.author.username, message.author.avatarURL())
            .setFooter("Requested by: " + message.author.tag)
            .setColor(0xc0392b);
        message.channel.send({
            embed: embed
        }).catch(e => Sentry.captureException(e));
        setTimeout(function() { // This is how to make a timeout of 1000ms :)
            client.destroy();
        }, 1000);
    }

    if (command === "math") {
        if (args[0] === "average") { // Average Subcommand
            if (args[1]) {
                sum = sum(args.slice(1));
                average1 = sum / args.slice(1).length;
                average = Math.round(average1 * 100) / 100;
                message.reply("The average is: " + average).catch(e => Sentry.captureException(e));
            } else {
                const embed = new Discord.MessageEmbed() // Typical form eor
                    .setTitle("Error while executing!")
                    .setDescription("Invalid arguments provided! <:NoShield:500245155266166784>")
                    .addField("Usage", "`" + config.prefix + "math average <number/numbers>`")
                    .setAuthor(message.author.username, message.author.avatarURL())
                    .setColor(0xe74c3c);
                message.channel.send({
                    embed: embed
                }).catch(e => Sentry.captureException(e));
            }
        } else if (args[0] === "sum") { // Sum Subcommand
            if (args[1]) {
                sum = sum(args.slice(1));
                message.reply("The sum is: " + sum).catch(e => Sentry.captureException(e));
            } else {
                const embed = new Discord.MessageEmbed() // Typical form eor
                    .setTitle("Error while executing!")
                    .setDescription("Invalid arguments provided! <:NoShield:500245155266166784>")
                    .addField("Usage", "`" + config.prefix + "math sum <number/numbers>`")
                    .setAuthor(message.author.username, message.author.avatarURL())
                    .setColor(0xe74c3c);
                message.channel.send({
                    embed: embed
                }).catch(e => Sentry.captureException(e));
            }
        } else {
            const embed = new Discord.MessageEmbed() // Typical form eor
                .setTitle("Command: math")
                .setDescription("Calculates with numbers.")
                .addField("Usage", "```md\n" + config.prefix + "math sum <number1> [number2...]\n" + config.prefix + "math average <number1> [number2...]```", true)
                .addField("Permissions required:", "NONE", true)
                .setAuthor(message.author.username, message.author.avatarURL())
                .setColor(0xe74c3c);
            message.channel.send({
                embed: embed
            }).catch(e => Sentry.captureException(e));
        }
    }

    if (command === "debug") {
        if (message.author.id !== config.owner) return;
        if (args[0] === "roles") {
            const roles = message.guild.roles.cache.map(r => "\n" + r.id + ': ' + r.name);
            message.channel.send("```\n" + roles + "```").catch(e => Sentry.captureException(e));
        } else if (args[0] === "send") {
            if (args[2]) {
                const channel1 = args[1];
                const text = args.slice(2).join(" ");
                message.guild.channels.cache.find(channel => channel.name === channel1).send(text)
                message.channel.send(":white_check_mark:").catch(e => Sentry.captureException(e));
            } else {
                message.channel.send("Invalid arguments provided!").catch(e => Sentry.captureException(e));
            }
        } else if (args[0] === "game") {
            if (args[2]) {
                const type = args[1].toUpperCase();
                const activity = args.slice(2).join(" ");
                client.user.setActivity(activity, { type: type }).catch(e => Sentry.captureException(e));
                const embed = new Discord.MessageEmbed()
                    .setDescription("The Playing Status has been changed to " + args[1] + " " + activity)
                    .setAuthor(message.author.username, message.author.avatarURL())
                    .setFooter("Requested by: " + message.author.tag)
                    .setColor(0x27ae60);
                message.channel.send({
                    embed: embed
                }).catch(e => Sentry.captureException(e));
                console.log("Bot Activity has been changed to " + type + " " + activity);
            } else {
                message.channel.send("Invalid arguments provided!").catch(e => Sentry.captureException(e));
            }
        } else if (args[0] === "dm") {
            const user = message.mentions.users.first();
            const content = args.slice(2).join(" ");
            if (user && content) {
                user.send(content).catch(e => Sentry.captureException(e));
                message.react('526078701830406173').catch(e => Sentry.captureException(e));
            } else {
                message.channel.send("Invalid arguments provided!").catch(e => Sentry.captureException(e));
            }
        } else if (args[0] === "status") {
            if (args[1]) {
                client.user.setStatus(args[1]).catch(e => Sentry.captureException(e));
                const embed = new Discord.MessageEmbed()
                    .setDescription("The Bot Status has been changed to " + args[1] + "!")
                    .setAuthor(message.author.username, message.author.avatarURL())
                    .setFooter("Requested by: " + message.author.tag)
                    .setColor(0x27ae60);
                message.channel.send({
                    embed: embed
                }).catch(e => Sentry.captureException(e));
                console.log("Bot Status has been changed to " + args[1] + "!");
            } else {
                message.channel.send("Invalid arguments provided!").catch(e => Sentry.captureException(e));
            }
        } else {
            const embed = new Discord.MessageEmbed() // Typical form eor
                .setTitle("Command: debug")
                .setDescription("Some secret commands for the bot owner...")
                .addField("Sub-commands;", "`roles`: Displays all roles and role-IDs of the guild.\n`send`: Sends a message to a channel.\n`status`: Changes the bot's status.\n`game`: Changes the bot's playing status.\n`dm`: Sends a private message to a mentioned user.")
                .addField("Usage", "```md\n" + config.prefix + "debug <sub-command> <args>```", true)
                .addField("Permissions required:", "`BOT_OWNER`", true)
                .setAuthor(message.author.username, message.author.avatarURL())
                .setColor(0xe74c3c);
            message.channel.send({
                embed: embed
            }).catch(e => Sentry.captureException(e));
        }
    }

});

client.login(config.token).catch(e => Sentry.captureException(e));