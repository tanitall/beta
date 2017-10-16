import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router";
import { login } from "../modules/account";
import { getWIFFromPrivateKey } from "neon-js";
import { encrypt_wif, decrypt_wif } from "neon-js";
import { sendEvent, clearTransactionEvent } from "../modules/transactions";
import { getAccountsFromWIFKey } from "neon-js";
import Logo from "./Brand/LogoBlank";

import goIcon from "../img/go-icon.png";

let wif;

const logo = require("../img/app-logo.png");

// TODO: move to neon-js
const verifyPrivateKey = wif => {
  try {
    // TODO: better check
    getAccountsFromWIFKey(wif)[0].address;
  } catch (e) {
    return false;
  }
  return true;
};

const onWifChange = (dispatch, history, wif) => {
  const value = wif.value;
  // TODO: changed back to only WIF login for now, getting weird errors with private key hex login
  if (verifyPrivateKey(value) === true) {
    dispatch(login(value));
    history.push("/dashboard");
  } else {
    dispatch(sendEvent(false, "That is not a valid private key"));
    setTimeout(() => dispatch(clearTransactionEvent()), 5000);
  }
};

let LoginPrivateKey = ({ dispatch, loggedIn, wif, history }) => (
  <div>
    <div id="login" className="container">
      <div className="row">
        <div className="col-xs-4 col-xs-offset-5">
          <Logo width={140} />
        </div>
      </div>

      <div className="row">
        <div className="col-xs-10 col-xs-offset-1">
          <div>
            <h1
              style={{ color: "white", textAlign: "center", marginBottom: 30 }}
            >
              Welcome to Morpheus
            </h1>
          </div>

          <div className="row">
            <div className="col-xs-9 col-xs-offset-1">
              <div className="form-group">
                <input
                  type="text"
                  className="trans-form"
                  type="text"
                  placeholder="Enter your NEO private key"
                  ref={node => (wif = node)}
                />
              </div>
              <hr className="purple" />
            </div>

            <div className="col-xs-2">
              <div
                style={{
                  marginTop: 80
                }}
                className="go-icon"
                onClick={e => onWifChange(dispatch, history, wif)}
              />
            </div>
          </div>
          <div className="col-xs-8 col-xs-offset-2">
            <p
              className="info"
              style={{ color: "#9B9B9B", fontSize: 18, marginLeft: 30 }}
            >
              Please load an existing wallet or create a new one.
            </p>
          </div>

          <div className="row">
            <div className="icon-bar">
              <Link to="/create">
                <div className="icon-cell">
                  <div className="new-icon" />
                  Create New Wallet
                </div>
              </Link>
              <Link to="/LoginLocalStorage">
                <div className="icon-cell">
                  <div className="lock-icon" />
                  Login With Saved Wallet
                </div>
              </Link>
              <Link to="/settings">
                <div className="icon-cell">
                  <div className="upload-icon" />
                  Upload Recovery File
                </div>
              </Link>
            </div>
          </div>

          <div className="row footer-info">
            <p>
              Your private key is only used to load your balance and transaction
              history from the blockchain.
            </p>
            <p>
              Once entered, it is encrypted and never shared. You can still use
              your private key with other wallets.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const mapStateToProps = state => ({
  loggedIn: state.account.loggedIn,
  wif: state.account.wif
});

LoginPrivateKey = connect(mapStateToProps)(LoginPrivateKey);

export default LoginPrivateKey;
