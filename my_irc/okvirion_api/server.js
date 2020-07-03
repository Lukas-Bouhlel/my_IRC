const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const route = express();
const http = require("http").createServer(route);
const io = require("socket.io")(http);

route.use(cors(), bodyParser.json(), bodyParser.urlencoded({extended: false}));

var channel = [
    {
        channel: "Accueil",
        lastMessageTime: ""
    }
];
var users = [
    "Baskri",
    "Kosya'baskri"
];
const maxNonActivity = 5; // Minutes //

setInterval(() => {
    if (outdated = channel.find(item => (new Date().getTime() - item.lastMessageTime) >= (maxNonActivity *  60 * 1000) && item.channel !== "Accueil")) {
        channel = channel.filter(item => item !== outdated);
        io.sockets.emit("leavechannel", outdated);
        let message = "Channel '"+outdated.channel+"' outdated deleted";
        io.sockets.emit("newmessage", {message, from: "Baskri", channel: ""});
    }
}, 100);

io.on("connection", (client) => {
    client.pseudo = "non-défini";
    client.on("connect-user", user => {
        client.joinChannel = [
            "Accueil"
        ];
        client.createChannel = [
    
        ];
        client.on("getjoinedchannel", i => {
            client.emit("joinedchannel", client.joinChannel);
        })
        let o = 0;
        while (users.find(item => item === user.trim()) && channel.find(item => item.channel === user.trim())) {
            o = parseInt(o) + 1;
            user = user.trim()+o;
        }
        client.pseudo = user;
        users = users.concat([client.pseudo]);
        client.emit("connection-success", client.pseudo);
        console.log("connect (id : "+client.id+", pseudo : "+client.pseudo+" )");
        client.on("message", msg => {
            let message = msg.message.trim();
            let channelName = msg.channel.trim();
            if (message != "" && message.length <= 2000) {
                if (client.joinChannel.find( item => item === channelName)) {
                    let updatedChannel = channel.find(item => item.channel === channelName && item.channel !== "Accueil");
                    if (updatedChannel) {
                        updatedChannel.lastMessageTime = new Date().getTime();
                        channel.forEach((element, index) => {
                            if (element.channel === channelName) {
                                if (channel[index])
                                    channel[index].lastMessageTime = updatedChannel.lastMessageTime;
                            }
                        });
                    }
                    io.sockets.emit("newmessage", {message: message, from: client.pseudo, channel: channelName, to: ""})
                }
            }
        });
        client.on("privatemessage", msg => {
            let message = msg.message.trim();
            let channelName = msg.channel.trim();
            if (message != "" && message.length <= 2000) {
                if (client.joinChannel.find( item => item === channelName)) {
                    let updatedChannel = channel.find(item => item.channel === channelName && item.channel !== "Accueil");
                    if (updatedChannel) {
                        updatedChannel.lastMessageTime = new Date().getTime();
                        channel.forEach((element, index) => {
                            if (element.channel === channelName) {
                                if (channel[index])
                                    channel[index].lastMessageTime = updatedChannel.lastMessageTime;
                            }
                        });
                    }
                    let to = msg.to.trim();
                    io.sockets.emit("newmessage", {message: message, from: client.pseudo, channel: channelName, to})
                }
            }
        })
        client.on("getuserlist", (chn) => {
            let array = [];
            exploreClients(user => {
                if (user.joinChannel) {
                    if (user.joinChannel.find(ch => ch === chn)) {
                        array = array.concat([user.pseudo]);
                        successCommand(array);
                    }
                }
            });
        })
        client.on("changenickname", username => {
            let o = 0;
            let old = client.pseudo;
            while (users.find(item => item === username.trim()) && channel.find(item => item.channel === username.trim())) {
                o = parseInt(o) + 1;
                username = username.trim()+o;
            }
            users = users.filter(item => item !== client.pseudo);
            client.pseudo = username;
            users = users.concat([client.pseudo]);
            client.emit("changenick-success", client.pseudo);
            let message = old + " changed nickname to "+ client.pseudo;
            io.sockets.emit("newmessage", {message, from: "Baskri", channel: "", to:""});
            successCommand("Votre pseudo "+old+" a bien été changé par "+client.pseudo);
        })
        client.on("askchannelist", string => {
            let patt = new RegExp(string);
            client.emit("getchannelist", channel.filter(item => patt.test(item.channel)));
            successCommand(channel.filter(item => patt.test(item.channel)));
        })
        client.on("deletechannel", chn => {
            if (client.createChannel.find(item => item === chn)) {
                channel = channel.filter(item => item.channel !== chn);
                io.sockets.emit("leavechannel", {channel: chn, lastMessageTime: ""});
                let message = "Channel '"+chn+"' deleted by "+client.pseudo;
                io.sockets.emit("newmessage", {message, from: "Baskri", channel: "", to:""});
            }
            else
                failCommand("Vous n'avez pas créé ce channel, vous ne pouvez donc pas le supprimer.");
        })
        client.on("leavechannel", chn => {
            let channelName = chn.channel;
            client.joinChannel = client.joinChannel.filter(item => item !== channelName);
            client.createChannel = client.createChannel.filter(item => item !== channelName);
            client.emit("joinedchannel", client.joinChannel);
            if (!chn.lastMessageTime) {
                let message = client.pseudo+" leaved the channel";
                io.sockets.emit("newmessage", {message, from: "Kosya'baskri", channel: channelName, to:""});
                successCommand("Vous avez quitté le channel avec succès !");
            }
            else {
                failCommand("Vous ne pouvez pas quitter l'Accueil !");
            }
        })
        client.on("joinchannel", chn => {
            let channelName = chn.channel;
            if (channel.find(item => item.channel === channelName)) {
                if (!client.joinChannel.find(item => item === channelName)) {
                    client.joinChannel = client.joinChannel.concat([channelName]);
                    client.emit("joinedchannel", client.joinChannel);
                    let message = client.pseudo+" joined the channel";
                    io.sockets.emit("newmessage", {message, from: "Kosya'baskri", channel: channelName, to:""});
                    successCommand("Vous avez rejoint le channel avec succès !");
                }
            }
            else
                failCommand("Le channel \""+channelName+"\" n'existe pas encore. Faites un /create "+channelName+" pour le créer.");
        })
        client.on("channel-create", chn => {
            let channelName = chn.channel.trim();
            if (!channel.find(item => item.channel === channelName) && !users.find(item => item === channelName) && channelName !== "" && channelName.length < 20) {
                channel = channel.concat([{channel: channelName, lastMessageTime: new Date().getTime()}]);
                client.joinChannel = client.joinChannel.concat([channelName]);
                client.createChannel = client.createChannel.concat([channelName]);
                client.emit("joinedchannel", client.joinChannel);
                let message = "Channel '"+channelName+"' created by "+client.pseudo;
                io.sockets.emit("newmessage", {message, from: "Baskri", channel: "", to:""});
                successCommand("Le channel a été créé avec succès !")
            }
            else
                failCommand("Le channel \""+channelName+"\" existe déjà. Faites un /join "+channelName+" pour le rejoindre.");
        })
    })
    client.on("disconnect", () => {
        users = users.filter(item => item !== client.pseudo);
        console.log("disconnect (id : "+client.id+", pseudo : "+client.pseudo+" )");
    });
    function failCommand(message) {
        client.emit("fail-message", message);
    }
    function successCommand(message) {
        client.emit("success-message", message);
    }
    function exploreClients(func) {
        let clients = Object.entries(io.sockets.connected);
        clients.forEach(item => {
            func(item[1]);
        });
    }
});

http.listen(4200, () => {
    console.log("Okvirion API running on port 4200")
});