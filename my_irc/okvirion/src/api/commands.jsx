import { socket } from "./socket";

const ClientCommand = {
    nick: function(nickname) {
        socket.emit("changenickname", nickname)
        socket.on("changenick-success", username => {
            localStorage.setItem("user", username);
        })
    },
    list: function(string="") {
        socket.emit("askchannelist", string);
        socket.on("getchannelist", list => {
            console.log(list);
        })
    },
    create: function(channel) {
        socket.emit("channel-create", {channel});
    },
    delete: function(channel) {
        socket.emit("deletechannel", channel);
    },
    join: function(channel) {
        socket.emit("joinchannel", {channel});
    },
    part: function(channel) {
        socket.emit("leavechannel", {channel})
    },
    users: function(channel) {
        socket.emit("getuserlist", channel);
    },
    msg: function(nickname, message, channel) {
        let object = {
            message,
            to: nickname,
            channel
        }
        socket.emit("privatemessage", object);
    }
};

export default ClientCommand;