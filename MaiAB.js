require('dotenv').config()

// Import Mai Functions
const mai = require("./maiFunctions")

// Req Discord api
const Discord = require('discord.js')
const client = new Discord.Client()

// Discord stuffs
const TOKEN = process.env.TOKEN
const ADMINID = process.env.ADMINID
const NHENTAIENABLE = process.env.NHENTAIENABLE
const NHCHANNEL = process.env.NHCHANNEL
const PREFIX = '/'

const showRegex = /\<(.+?)\>/
const seiyuuRegex = /\[(.+?)\]/
const mangaRegex = /\{(.+?)\}/
const nhentaiNumbersRegex = /\b([0-9]){5,6}\b/

function hook(channel, title, message, color, avatar) {

    if (!channel) return console.log('Channel not specified.');
    if (!title) return console.log('Title not specified.');
    if (!message) return console.log('Message not specified.');
    if (!color) color = 'FFFF00' ;
    if (!avatar) avatar = 'https://cdn.discordapp.com/avatars/755416995532636160/f4ae564aefbb8a88764d918a869c25f0.png'


    color = color.replace(/\s/g, '');
    avatar = avatar.replace(/\s/g, '');

    channel.fetchwebhooks()
    .then(webhook => {
        let foundhook = webhook.find('name', 'Kazumaid');

        if (!foundHook) {
            channel.createWebhook('Kazumaid', 'https://cdn.discordapp.com/avatars/755416995532636160/f4ae564aefbb8a88764d918a869c25f0.png')
               .then(webhook => {
                   webhook.send('', {
                       "username": title,
                       "avatarURL": avatar,
                       "embeds": [{
                           "color": parseInt(`0x${color}`),
                           "description":message
                       }]
                   })
                   .catch(error => {
                       console.log(error);
                       return channel.send('**Something went wrong when sending the webhook. Please check console**');
                   })

               })
        } else {
            foundHook.send('', {
                "username": title,
                "avatarURL": avatar,
                "embeds": [{
                    "color": parseInt(`0x${color}`),
                    "description":message
                }]
            })
            .catch(error => {
                console.log(error);
                return channel.send('**Something went wrong when sending the webhook. Please check console**');
            })
    }
})

}

var verboseReverb = false

client.on('ready', () => console.log('Mai is ready! <3'))

client.on('error', console.error)

client.on('message', async message => {
    if (message.author.bot) {
        return
    }
    const command = message.content.toLowerCase().split(' ')[0]
    const arguments = message.content.split(' ')
    const guildowner = message.channel.guild.ownerID
    const messageauthor = message.author.id
    arguments.shift()

    if (verboseReverb) {
        console.log("VERBOSE: " + message.content)
        message.channel.send("VERBOSE: " + "```\n" + escapeMarkdown(message.content) + "\n```")
    }

    switch (command) {

        case `${PREFIX}ping`:
            message.reply('I\'m here!')
            return

        case `${PREFIX}whatsmyid`:
            message.reply('Your discord author id is ' + messageauthor)
            return

        case `${PREFIX}debug`:
            if (ADMINID != undefined) {
                if (messageauthor == ADMINID) {
                    mai.handleDebug(arguments, message)
                }
            }
            return

        case `${PREFIX}mal`:
            mai.handleMalQuery(arguments.join(" "), message, true, false)
            return

        case `${PREFIX}7up`:
            mai.handleMalQuery(arguments.join(" "), message, true, true)
            return

        case `${PREFIX}seiyuu`:
            mai.handleSeiyuuQuery(arguments.join(" "), message, true)
            return

        case `${PREFIX}manga`:
            mai.handleMangaQuery(arguments.join(" "), message, true)
            return

        case `${PREFIX}purge`:
            mai.handlePurge(arguments, message, guildowner, messageauthor, ADMINID)
            return

        case `${PREFIX}movechat`:
            mai.handleMoveChat(arguments, message, guildowner, messageauthor, ADMINID)
            return

        case `${PREFIX}delete`:
            mai.handleDeleteMessage(arguments, message, guildowner, messageauthor, ADMINID)
            return

        case `${PREFIX}hook`:
            message.delete();
            if (`${PREFIX}hook`) {
                return hook(message.channel, 'Hook Usage', `${PREFIX}hook <title>, <message>, [HEXcolor], [avatarURL]\n\n**<> is required\n[] is optional**`,'FFFF00','https://cdn.discordapp.com/avatars/755416995532636160/f4ae564aefbb8a88764d918a869c25f0.png')
            }

            let hookArgs = message.content.slice(prefix.length + 6).split(",");

            hook (message.channel, hookArgs[0], hookArgs[1], hookArgs[2], hookArgs[3]);

        case `${PREFIX}pin`:
            mai.handlePinMessage(arguments, message, guildowner, messageauthor, true, ADMINID)
            return

        case `${PREFIX}unpin`:
            mai.handlePinMessage(arguments, message, guildowner, messageauthor, false, ADMINID)
            return

        case `${PREFIX}dev` :
            message.channel.send('Hello! My Developer is <@!427454146421981184>. This bot is under development! Stay tuned for more commands');
            return

        case `${PREFIX}nh`:
            var query = arguments.join(" ")
            if (query.length < 0) {
                mai.temporaryMessage('Please give me somthing to search', message)
                return
            } else {
                mai.handlenhentai(query, message, NHCHANNEL)
            }
            return
    }

    var matches = message.content.match(showRegex)
    if (matches) {
        var query = matches[1]
        var deletemessage = matches[0] == message.content
        if (query.startsWith("@") || query.startsWith(":") || query.startsWith("#") || query.startsWith("a:")) {
            return
        }
        mai.handleMalQuery(query, message, deletemessage, false)
    }

    var seiyuumatches = message.content.match(seiyuuRegex)
    if (seiyuumatches) {
        var query = seiyuumatches[1]
        var deletemessage = seiyuumatches[0] == message.content
        mai.handleSeiyuuQuery(query, message, deletemessage)
    }

    var mangamatches = message.content.match(mangaRegex)
    if (mangamatches) {
        var query = mangamatches[1]
        var deletemessage = mangamatches[0] == message.content
        mai.handleMangaQuery(query, message, deletemessage)
    }

    if (NHENTAIENABLE != undefined) {
        var nhentaimatches = message.content.match(nhentaiNumbersRegex)
        if (nhentaimatches) {
            var query = nhentaimatches
            mai.handlenhentai(query[0], message, NHCHANNEL)
        }
    }
})

client.login(TOKEN)

function escapeMarkdown(string) {
    var replacements = [
        [/\`\`\`/g, '`​`​`​']
    ]
    return replacements.reduce(
        function (string, replacement) {
            return string.replace(replacement[0], replacement[1]);
        }, string)
}