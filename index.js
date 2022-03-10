const Discord = require("discord.js");
const fs = require("fs");
var pref = require("./pref.json");
var userqueue = [];
var channelqueue = [];
const bot = new Discord.Client();
bot.login("insert token");
const MANAGED_ID = "your id";
var Pseudo = false;
bot.users.fetch(MANAGED_ID).then(user => {
    Pseudo = user;
});
bot.on('ready', () => {
    console.log("Alleluia it is working")
    bot.user.setActivity("over Pseudo | mention me to get an appointment with Pseudo", {type: 3});
});
const prefix = "&&&&"; 

function InArray(obj, arr) {
    let bool = false
    arr.forEach(e => {
        if (e == obj) return bool = true;
    });
    return bool
}

bot.on("message", message => {
    if (message.guild == null && message.author.id != MANAGED_ID) return;
    if (message.mentions.users.first()) {
        if (message.mentions.users.first().id == bot.user.id) { // @ manager
            if (message.content.indexOf("tchoin") >= 0 || message.content.indexOf("salope") >= 0 || message.content.indexOf("pute") >= 0) return message.channel.send("jte parle pas")
            if (pref.dnd) return message.channel.send("Pseudo est actuellement indisponible. Si vous voulez le contacter, merci d'envoyer le message qui lui est destiné en le mentionnant.");
            return message.channel.send ("Pseudo est actuellement disponible. Vous pouvez le contacter en le mentionnant.")
        }
        if (message.mentions.users.first().id == MANAGED_ID && pref.dnd) { // @ Pseudo
            if (InArray(message.author.id, pref.mutes)) return message.channel.send("Il te parle pas wesh")
            else if (Pseudo) {
                message.channel.send("Pseudo ne veut pas être dérangé, je transmets votre message.")
                let embed = new Discord.MessageEmbed()
                .setColor('0xa91101')
                .setTitle(`${message.author.username} sent you a message`)
                .setDescription(message.content);
                Pseudo.send(embed)
            }
            else {
                message.channel.send("Sorry, Pseudo don't want to be disturbed, and I lost connection with him.")
            }
        }
    }
    else if (pref.onoff && InArray(message.author.id, pref.users) && (!InArray(message.author.id, userqueue))) { // Un utilisateur qu'on aime
        userqueue.push(message.author.id)
        setTimeout(()=> {
            let i = userqueue.indexOf(message.author.id);
            if (i >= 0) userqueue.splice(i,1);
        },600000)
        let embed = new Discord.MessageEmbed()
        .setColor('0xff7f00')
        .setTitle(`${message.author.username} sent a message`)
        .setDescription(message.content);
        Pseudo.send(embed)
    }
    else if (pref.onoff && pref.servers[message.guild.id] && (!InArray(message.channel.id, channelqueue))) { // Un channel qu'on aime
        if (InArray(message.channel.id, pref.servers[message.guild.id])) {
        channelqueue.push(message.channel.id)
        setTimeout(()=> {
            let i = channelqueue.indexOf(message.channel.id);
            if (i >= 0) channelqueue.splice(i,1);
        },600000)
        let embed = new Discord.MessageEmbed()
        .setColor('0xffd300')
        .setTitle(`A message was sent in ${message.channel.name}, in ${message.guild.name}`)
        .setDescription(message.content);
        Pseudo.send(embed)       
        }
    }
    if (!(message.content.startsWith(prefix) && message.author.id == MANAGED_ID)) return true; // Les commandes
    let args = message.content.split(" ").splice(1);
        if (args[0] == "dnd") { // dnd
            if (args[1] == "on") {
                message.react("✅");
                return pref.dnd = true;
            } else if (args[1] == "off") {
                message.react("✅");
                return pref.dnd = false;
            }
        } else if (args[0] == "switch") { // switch
            if (args[1] == "on") {
                message.react("✅");
                return pref.onoff = true;
            } else if (args[1] == "off") {
                message.react("✅");
                return pref.onoff = false;
            }
        } else if (args[0] == "notify") {
            message.react("✅");
            if (args.length > 1) {
                if (!pref.servers[message.guild.id]) pref.servers[message.guild.id] = [];
                let i = pref.servers[message.guild.id].indexOf(message.channel.id);
                if (i >= 0) pref.servers[message.guild.id].splice(i,1);
            }
            else {
                if (!pref.servers[message.guild.id]) pref.servers[message.guild.id] = []
                if (!InArray(message.channel.id, pref.servers[message.guild.id])) pref.servers[message.guild.id].push(message.channel.id);
            }
        } else if (args[0] == "mute") {
            let user = message.mentions.users.first();
            if (!user) {
                if (!args[1]) return console.log("wrong input");
                user = args[1]
            }
            else {
                user = user.id;
            }
            message.react("✅");
            if (!InArray(user, pref.mutes)) pref.mutes.push(user);
        } else if (args[0] == "demute") {
            let user = message.mentions.users.first()
            if (!user) {
                if (!args[1]) return console.log("wrong input");
                user = args[1]
            }
            else {
                user = user.id;
            }
            message.react("✅");
            let i = pref.mutes.indexOf(user);
            if (i >= 0) pref.mutes.splice(i,1);
        } else if (args[0] == "listen") {
            let user = message.mentions.users.first();
            if (!user) {
                if (!args[1]) return console.log("wrong input");
                user = args[1]
            }
            else {
                user = user.id;
            }
            message.react("✅");
            if (!InArray(user, pref.users)) pref.users.push(user);
        } else if (args[0] == "neglect") {
            let user = message.mentions.users.first()
            if (!user) {
                if (!args[1]) return console.log("wrong input");
                user = args[1]
            }
            else {
                user = user.id;
            }
            message.react("✅");
            let i = pref.users.indexOf(user);
            if (i >= 0) pref.users.splice(i,1);
        } else if (args[0] == "help") {
            Pseudo.send("Here are my commands : help, neglect, listen, mute, demute, dnd, notify, on, off")
        }
})