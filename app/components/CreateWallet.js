import React, { Component } from "react";
import { connect } from "react-redux";
import { newWallet, generating } from "../modules/generateWallet";
import { Link } from "react-router";
import WalletInfo from "./WalletInfo.js";
import QRCode from "qrcode";
import { clipboard } from "electron";
import Copy from "react-icons/lib/md/content-copy";
import ReactTooltip from "react-tooltip";
import DisplayWalletKeys from "./DisplayWalletKeys";
import { generateEncryptedWif } from "neon-js";
import { sendEvent, clearTransactionEvent } from "../modules/transactions";
import Logo from "./Brand/LogoBlank";
import NeoLogo from "./Brand/Neo";
import IconBar from "./IconBar";

const logo = require("../img/app-logo.png");

let passphrase, passphrase2;

// TODO: move to neon-js
// what is the correct length to check for?
const validatePassphrase = passphrase => {
  return passphrase.length >= 4;
};

const generateNewWallet = dispatch => {
  const current_phrase = passphrase.value;
  if (passphrase.value !== passphrase2.value) {
    dispatch(sendEvent(false, "Passphrases do not match"));
    setTimeout(() => dispatch(clearTransactionEvent()), 5000);
    return;
  }
  if (validatePassphrase(current_phrase)) {
    // TODO: for some reason this blocks, so giving time to processes the earlier
    // dispatch to display "generating" text, should fix this in future
    dispatch(sendEvent(true, "Generating wallet keys"));
    setTimeout(() => {
      generateEncryptedWif(current_phrase).then(result => {
        dispatch(newWallet(result));
        dispatch(clearTransactionEvent());
      });
    }, 500);
  } else {
    dispatch(sendEvent(false, "Please choose a longer passphrase"));
    setTimeout(() => dispatch(clearTransactionEvent()), 5000);
    passphrase.value = "";
    passphrase2.value = "";
  }
};

class CreateWallet extends Component {
  render = () => {
    const passphraseDiv = (
      // <DisplayWalletKeys
      //   history={this.props.history}
      //   address={"APzvcgSUhFsqffnCcr2G6Q76wAzbxkR7cp"}
      //   wif={"L2iFQdKp71bpu7STW4d2cZzt8BLaMHVKv7WaDYQq4rkdL9tUTn2a"}
      //   passphrase={"Phaedrus2910"}
      //   passphraseKey={
      //     "6PYMN2kN8RJ8Es9jWiR7WtKYdivucbwribqgTa6r4mJVGuqjPwiP8mNYWd"
      //   }
      // />
<div>
      <div className="login-address-bk top-50">
        <div className="row logo-top">
          <div className="center">
            <Logo width={140} />
          </div>

          <div className="col-xs-10 col-xs-offset-1">
            <div className=""><br />
              <h1 style={{ color: "white", textAlign: "center" }}>
                Create a NEO Address
              </h1>
            </div>

            <div className="row">
              <div className="col-xs-offset-1 col-xs-10">
                <div className="form-group">
                  <input
                    type="text"
                    className="trans-form"
                    ref={node => (passphrase = node)}
                    placeholder="Enter a secure password"
                  />
                </div>
                <hr className="purple" />
                <div className="form-group">
                  <input
                    type="text"
                    className="trans-form"
                    ref={node => (passphrase2 = node)}
                    placeholder="Confirm your password"
                  />
                </div>
              </div>

              <div className="col-xs-2">
                <div
                  className="go-icon"
                  onClick={() => generateNewWallet(this.props.dispatch)}
                />
              </div>
            </div>
          </div>
        </div>

      </div>
      <div className="row">
        <div className="dash-bar">
          <Link to="/LoginLocalStorage">
          <div className="dash-icon-bar">
            <div className="icon-border">
            <span className="glyphicon glyphicon-user"></span>
            </div>
            Open a Saved Wallet
          </div>
          </Link>

          <Link to="/">
          <div className="dash-icon-bar">
            <div className="icon-border">
            <span className="glyphicon glyphicon-qrcode"></span>
            </div>
            Login Using Private Key
          </div>
          </Link>

          <Link to="/settings">
          <div className="dash-icon-bar">
            <div className="icon-border">
              <span className="glyphicon glyphicon-open"></span>
            </div>
            Login Via Recovery File
          </div>
          </Link>
        </div>
      </div>
</div>
    );
    return (
      <div id="newWallet">
        {this.props.wif === null ? passphraseDiv : <div />}
        {this.props.generating === true ? (
          <div className="generating">Generating keys</div>
        ) : (
          <div />
        )}
        {this.props.generating === false && this.props.wif !== null ? (
          <DisplayWalletKeys
            history={this.props.history}
            address={this.props.address}
            wif={this.props.wif}
            passphrase={this.props.passphrase}
            passphraseKey={this.props.encryptedWif}
          />
        ) : (
          <div />
        )}
      </div>
    );
  };
}

const mapStateToProps = state => ({
  wif: state.generateWallet.wif,
  address: state.generateWallet.address,
  encryptedWif: state.generateWallet.encryptedWif,
  passphrase: state.generateWallet.passphrase,
  generating: state.generateWallet.generating
});

CreateWallet = connect(mapStateToProps)(CreateWallet);

export default CreateWallet;
