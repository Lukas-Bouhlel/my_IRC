import React from 'react';
import './App.css';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { HomePage, SeeChannel, CommandColumn } from "./api/login";
import { GetJoinedChannel } from "./api/socket";

class App extends React.Component {
  state = {
    height: "",
    list: []
  }
  constructor(props) {
    super(props);

    this.updateDimensions = this.updateDimensions.bind(this);
  }
  componentDidMount() {
    GetJoinedChannel((list) => {
      this.setState({list})
      if (this.state.channel) {
        if (!this.state.list.find((element) => element === this.state.channel)) {
          this.setState({channel: "Accueil"});
        }
      }
    });
    this.updateDimensions();
    window.addEventListener("resize", this.updateDimensions);
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }
  updateDimensions() {
    this.setState({height: window.innerHeight});
  }
  removeColoredOnglet(e)  {
    let children = e.target.parentElement.children;
    for (let i = 0; i < children.length; i++) {
      children[i].style.backgroundColor = "";
      children[i].style.transition = "1s";
      children[i].style.paddingLeft = "0px";
    }
  }
  render() {
    var channel = this.state.channel;
    let i = 0;
    return (
      <Router>
        <div className="sidebar column" style={{height: this.state.height}}>
          <img src="pp-okvrion.gif" alt="animé" className="logo" onClick={(e) => {
            this.setState({channel: undefined});
            this.removeColoredOnglet(e);
          }}/>
          {this.state.list.map(item => 
            <div key={i++} className="onglet-channel" style={{cursor: "pointer"}} channel={item} onClick={(e) => {
                this.removeColoredOnglet(e);
                e.target.style.backgroundColor = "#2c2f33";
                e.target.style.borderRadius = "20px";
                e.target.style.paddingLeft = "5px";
                this.setState({channel: e.target.attributes.channel.value});
            }}># {item}</div>
          )}
        </div>
        <Switch>
          <Route exact path="/">
            <div className="column content">
              {channel ? <SeeChannel channel={channel} />: <HomePage/>}
            </div>
            {channel ? <CommandColumn channel={channel}></CommandColumn> : <div></div>}
          </Route>
        </Switch>
      </Router>
    );
  }
}

export default App;
