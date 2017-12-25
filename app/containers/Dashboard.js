import React, { Component } from "react";
import { connect } from "react-redux";
import SplitPane from "react-split-pane";
import { Link } from "react-router";
import QRCode from "qrcode";
import axios from "axios";
import numeral from "numeral";
import { resetKey } from "../modules/generateWallet";
import FaArrowUpward from "react-icons/lib/fa/arrow-circle-up";
import { NetworkSwitch } from "../components/NetworkSwitch";
import WalletInfo from "../components/WalletInfo";
import TransactionHistory from "../components/TransactionHistory";
import Exchange from "../components/Exchange";
import Support from "../components/Support";
import Tokens from "../components/Tokens";
import { initiateGetBalance, intervals } from "../components/NetworkSwitch";
import { sendEvent, clearTransactionEvent } from "../modules/transactions";
import Logout from "../components/Logout";
import Send from "../components/Send";
import { togglePane } from "../modules/dashboard";
import { version } from "../../package.json";
import { log } from "../util/Logs";
import Dashlogo from "../components/Brand/Dashlogo";
import ReactTooltip from "react-tooltip";

const refreshBalance = (dispatch, net, address) => {
  dispatch(sendEvent(true, "Refreshing..."));
  initiateGetBalance(dispatch, net, address).then(response => {
    dispatch(sendEvent(true, "Received latest blockchain information."));
    setTimeout(() => dispatch(clearTransactionEvent()), 1000);
  });
};

const resetGeneratedKey = dispatch => {
  dispatch(resetKey());
};

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      combinedPrice: 0
    };
  }

  async componentDidMount() {
    // only logging public information here
    await log(this.props.net, "LOGIN", this.props.address, {});
    await initiateGetBalance(
      this.props.dispatch,
      this.props.net,
      this.props.address,
      this.props.price
    );
    resetGeneratedKey(this.props.dispatch);
    await this.getCombinedBalance(this.props.neo, this.props.gas);
  }

  getCombinedBalance = async (neo, gas) => {
    let neoPrice = await axios.get(
      "https://api.coinmarketcap.com/v1/ticker/neo/"
    );
    let gasPrice = await axios.get(
      "https://api.coinmarketcap.com/v1/ticker/gas/"
    );
    neoPrice = neoPrice.data[0].price_usd;
    gasPrice = gasPrice.data[0].price_usd;

    let value = neoPrice * neo + gasPrice * gas;
    let combinedPrice = Math.round(value * 100) / 100;
    this.setState({ combinedPrice: combinedPrice });
  };

  render = () => {
    let sendPaneClosed;
    if (this.props.sendPane == true) {
      sendPaneClosed = "0%";
    } else {
      if (this.props.confirmPane == false) {
        sendPaneClosed = "21%";
      } else {
        sendPaneClosed = "15%";
      }
    }

    let dash = (
      <div className="container">
        <WalletInfo />
      </div>
    );

    if (this.props.location.pathname !== "/dashboard") {
      dash = <div />;
    }

    return (
      <div>
        <div id="mainNav" className="main-nav">
          <div className="navbar navbar-inverse">
            <div className="navbar-header">
              <div className="logoContainer">
                <Dashlogo width={90} />
              </div>
              <div id="balance"
              onClick={() =>
            refreshBalance(
              this.props.dispatch,
              this.props.net,
              this.props.address
            )} >
                <span style={{ fontSize: "10px" }}>Combined Value</span>
                <br />
                {numeral(this.state.combinedPrice).format("$0,0.00")}
              </div>
            </div>
            <div className="clearfix" />
            <div className="navbar-collapse collapse">
              <ul className="nav navbar-nav">
                <li>
                  <Link to={"/dashboard"} activeClassName="active">
                    <div className="glyphicon glyphicon-stats" /> Dashboard
                  </Link>
                </li>
                <li>
                  <Link to={"/send"} activeClassName="active">
                    <span className="glyphicon glyphicon-send" /> Send
                  </Link>
                </li>
                <li>
                  <Link to={"/receive"} activeClassName="active">
                    <span className="glyphicon glyphicon-qrcode" /> Receive
                  </Link>
                </li>
                <li>
                  <Link to={"/transactionHistory"} activeClassName="active">
                    <span className="glyphicon glyphicon-list-alt" /> History
                  </Link>
                </li>
                <li>
                  <Link to={"/settings"} activeClassName="active">
                    <span className="glyphicon glyphicon-lock" /> Settings
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <span className="dashnetwork">Network: {this.props.net}</span>
          <div className="copyright">&copy; Copyright 2017 Morpheus</div>
        </div>
        <div style={{ marginLeft: 230, marginTop: 20 }}>
          <div className="container">{this.props.children}</div>
          {dash}
        </div>
      </div>
    );
  };
}

const mapStateToProps = state => ({
  sendPane: state.dashboard.sendPane,
  confirmPane: state.dashboard.confirmPane,
  blockHeight: state.metadata.blockHeight,
  net: state.metadata.network,
  address: state.account.address,
  neo: state.wallet.Neo,
  gas: state.wallet.Gas,
  price: state.wallet.price
});

Dashboard = connect(mapStateToProps)(Dashboard);

export default Dashboard;
