import openSocket from "socket.io-client";
import ClientCommand from "./commands";
import React from 'react';
const socket = openSocket("http://localhost:4200");

socket.on("leavechannel", chn => {
    socket.emit("leavechannel", chn)
})

if (localStorage.getItem("user")) {
    socket.emit("connect-user", localStorage.getItem("user"));
    socket.on("connection-success", user => {
        localStorage.setItem("user", user);
    })
}

class GetMessage extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            messages: [],
            i: 0,
            channel: props.channel
        }
    }
    componentDidMount() {
        socket.on("newmessage", msg => {
            if (msg.to === localStorage.getItem("user") || msg.to === "" || msg.from === localStorage.getItem("user"))
                this.setState({messages : this.state.messages.concat([msg])});
        })
    }
    render() {
        let i = 0;
        return (
            <div style={{overflow: "auto", minWidth:500, maxWidth: 500, maxHeight: 500}}>
            {this.state.messages.filter(item => item.channel === this.props.channel || item.channel === "").map(res =>
            
                <div key={i++} className={res.to === "" ? "msg" : "wsp"}><span className={"msg-username"}>{res.from} : </span>{res.message}</div>
            )}
            </div>
        );
    }
}

function GetJoinedChannel(func) {
    socket.emit("getjoinedchannel");
    socket.on("joinedchannel", func)
}

function CreateChannel(channelName) {
    socket.emit("channel-create", {channel: channelName});
}

var message = "";
function SendMessage(props) {
    return (
    <div>
        <form className="textbox-message" onSubmit={(e)=> {
            e.preventDefault();
            if (message.startsWith("/")) {
                message = message.substr(1)
                let command = message.split(" ")
                let func = command[0];
                let param = command[1];
                if (command[2]) {
                    let param1 = command[2];
                    if (func === "msg") {
                        command.shift()
                        command.shift()
                        param1 = command.join(" ")
                        let param2 = props.channel;
                        ClientCommand[func](param, param1, param2);
                    }
                    else {
                        ClientCommand[func](param, param1);
                    }
                }
                else {
                    if (!param && (func === "delete" || func === "part" || func === "users"))
                        param = props.channel;
                    if (ClientCommand[func])
                        ClientCommand[func](param);  
                }
            }
            else 
                socket.emit("message", {message: message, pseudo: localStorage.getItem("user"), channel: props.channel});
            message = "";
            e.target.children[0].value = "";
            }}>
            <input className="create-message" type="text" onChange={e => {
                message = e.target.value.trim();
            }} />
            <input className="label" type="submit" value={"Envoyer le message"}/>
        </form>
    </div>
    );
}

export { SendMessage, GetMessage, CreateChannel, GetJoinedChannel, socket };