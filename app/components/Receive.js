import React, { Component } from "react";
import { connect } from "react-redux";
import QRCode from "qrcode.react";
import neoLogo from "../images/neo.png";

class Receive extends Component {
  render() {
    return (
      <div id="receive" className="">
        <div className="row ">
          <div className="header">
            <div className="col-xs-4">
              <p className="neo-balance">My Balance</p>
              <p className="neo-text">
                {this.props.neo} <span>NEO</span>{" "}
              </p>
            </div>
            <div className="col-xs-4">
              <img src={neoLogo} alt="" width="115" className="neo-logo" />
            </div>
            <div className="col-xs-4">
              <p className="price-header">NEO Price</p>
              <p className="price">$</p>
            </div>
          </div>
        </div>

        <div className="row">
          <h1>Receive NEO / GAS</h1>
        </div>

        <div className="row">
          <div className="col-xs-4 col-xs-offset-3">
            <div className="addressBox-send ">
              <QRCode size={180} value={"this.props.address"} />
            </div>
          </div>
        </div>

        <div className="row">
          <p className="address">{this.props.address}</p>
          <p className="info">Send NEO or GAS to this address ONLY.</p>
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
