import React, { Component } from "react";
import { connect } from "react-redux";
import QRCode from "qrcode.react";
import neoLogo from "../images/neo.png";
import copyIcon from "../images/copy-icon.png";
import printIcon from "../images/print-icon.png";
import emailIcon from "../images/email-icon.png";
import linkIcon from "../images/link-icon.png";

class Receive extends Component {
  render() {
    return (
      <div id="receive" className="">
        <div className="row ">
          <div className="header">
            <div className="col-xs-4">
              <p className="neo-balance">Available Neo</p>
              <p className="neo-text">
                {this.props.neo} <span>NEO</span>{" "}
              </p>
            </div>
            <div className="col-xs-4">
            <div id="gas-gauge">
              <div id="gas-button">
                <span class="gas-claim">
                  Claim Gas<br />
                  0.000000
                </span>
              </div>
              </div>
            </div>
            <div className="col-xs-4">
              <p className="neo-balance">Available GAS</p>
              <p className="neo-balance">{Math.floor(this.props.gas * 10000) / 10000}</p>
            </div>
          </div>
        </div>

        <div className="row">
          <h1>Receive NEO / GAS</h1>
        </div>

        <div className="row">
          <div className="col-xs-4">
          <div className="center-qr">
            <div className="addressBox-send">
              <QRCode size={180} value={"this.props.address"} />
            </div>
            </div>
          </div>
        </div>

        <div className="row">
          <p className="address">{this.props.address}</p>
          <p className="info">Send NEO or GAS to this address ONLY.</p>
          <div className="dash-icon-bar"><img src={copyIcon} alt="" width="48" className="copy-icon" />
          <img src={printIcon} alt="" width="48" className="print-icon" />
          <img src={emailIcon} alt="" width="48" className="email-icon" />
          <img src={linkIcon} alt="" width="48" className="link-icon" />
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  blockHeight: state.metadata.blockHeight,
  net: state.metadata.network,
  address: state.account.address,
  neo: state.wallet.Neo
});

Receive = connect(mapStateToProps)(Receive);
export default Receive;
