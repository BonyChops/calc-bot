const Discord = require('discord.js');
const command = require('child_process')
const client = new Discord.Client();
const fs = require('fs');
const token = JSON.parse(fs.readFileSync("./config/token.json")).token;

const exec = (cmd) => {
    return new Promise((resolve, rejects) => {
        command.exec(cmd, (err, stdout, stderr) => {
            if (err) {
                rejects(stderr);
            }
            resolve(stdout);
        })
    })
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async (msg) => {
    const TeXBot = msg.guild.members.cache.find(member => member.id == "708145562880311356");
    if (msg.content.indexOf("!calc") === -1 || msg.author.id === client.user.id) return;
    msg.channel.startTyping();
    let isTeX = (msg.content.indexOf("!calc-tex") !== -1);
    let prefixCounter = !isTeX ? 5 : 9;
    if (isTeX && (TeXBot === undefined || TeXBot.presence.status == "offline")) {
        msg.reply("TeX Botがオフラインであるかこの鯖にいないため使用できない！\n通常の計算モードに変えます！");
        isTeX = false;
    }
    let command = msg.content.substr(msg.content.indexOf("!calc") + (prefixCounter));
    if (isTeX) command = `tex(${command})`
    if (command.indexOf("system") !== -1) {
        msg.reply("くッ！ 俺の知能では理解できないッッッ！！(コマンドが間違っている可能性があります)");
        msg.channel.stopTyping();
        return;
    }
    const result = await exec(`timeout 10 maxima --batch-string="${command};" --very-quiet`);
    const lines = result.split(/\r*\n/).filter(el => el.trim() != '');
    const linesNum = lines.length;
    if (!isTeX) {
        if (linesNum <= 2) {
            console.log("a");
            msg.reply(lines[1].trim());
        } else {
            msg.reply(`\`\`\`${lines.filter((line, i) => i >= 1).join("\n")}\`\`\`\nヒント: !calc-texをオススメします`);
        }
    } else {
        const TeXCommand = lines.filter((line, i) => (i >= 1 && i != linesNum - 1)).join("\n");

        msg.channel.send(`!tex \\[${TeXCommand.substr(2, TeXCommand.length - 4)}\\]`);
    }
    msg.channel.stopTyping();
    console.log(result);
});

client.login(token);