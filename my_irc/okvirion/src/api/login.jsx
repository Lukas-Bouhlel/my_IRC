import React from 'react';
import { SendMessage, GetMessage, CreateChannel, socket } from "./socket";

class CommandColumn extends React.Component {
    state = {
        channel: "",
        userList: [],
        success: "",
        fail: "",
        channelold: ""
    }
    render() {
        socket.on("success-message", msg => {
            if (typeof msg === "object") {
                let array = msg;
                msg = "";
                array.forEach((item) => {
                    if (item.channel)
                        msg += item.channel + " ";
                    else {
                        msg = array.join(", ")
                    }
                });
            }
            this.setState({success: msg});
            this.setState({fail: ""});
        });
        socket.on("fail-message", msg => {
            this.setState({fail: msg});
            this.setState({success: ""});
        })
        return (
            <div className="column command">
                <h2>Channel : {this.props.channel}</h2>
                <hr></hr>
                {this.state.success !== "" ? <div style={{color: "green"}}>Succès : {this.state.success}</div>: <div></div>}
                {this.state.fail !== "" ? <div style={{color: "red"}}>Erreur : {this.state.fail}</div>: <div></div>}
            </div>
        );
    }
}

class HomePage extends React.Component {
    state = {
        name: "",
        channel: ""
    }
    render() {
        if (localStorage.getItem("user")) {
            return (
                <div>
                    <div className='ChannelCreate'>Bonjour {localStorage.getItem("user")} ! Créez votre channel ou rejoignez-en un.</div>
                    <form onSubmit={e => {
                        e.preventDefault();
                        CreateChannel(this.state.channel);
                        e.target.children[0].value = "";
                    }}>
                        <input type="text" className="create-textbox" id="channel"onChange={(e) => {
                            this.setState({channel: e.target.value});
                        }} placeholder="Nom de votre channel..."/>
                        <input type='submit'className="label" value="Créer le channel"/>
                    </form>
                </div>
            );
        }
        else {
            return (
                <form onSubmit={(e) => {
                    e.preventDefault();
                    localStorage.setItem("user", this.state.name.trim());
                    socket.emit("connect-user", localStorage.getItem("user"));
                    socket.on("connection-success", user => {
                        localStorage.setItem("user", user);
                    })
                    this.setState({name: ""})
                }}>
                    <input className="create-textbox" type="text" onChange={(e)=> {
                        e.preventDefault();
                        this.setState({name: e.target.value});
                    }} placeholder="Votre pseudo" />
                    <input className="label" type="submit" value="Choisir mon pseudo"/>
                </form>
            );
        }
    }
}

function SeeChannel(props) {
    if (localStorage.getItem("user")) {
        return (
            <div>
                <GetMessage channel={props.channel}/>
                <SendMessage channel={props.channel}/>
            </div>
        );
    }
    else
        return (
        <div>Pas de pseudo</div>
        );
}

export { HomePage, SeeChannel, CommandColumn };