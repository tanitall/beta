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
  <div className="login-address-bk top-50">
    <div className="logo-top">
      <div className="row">
        <div className="center">
          <Logo width={140} />
        </div>
      </div>

      <div className="row">
        <div className="col-xs-12">
          <div><br />
            <h1 className="center">
              Welcome to Morpheus
            </h1>
          </div>

          <div className="row top-50">
            <div className="col-xs-10 col-xs-offset-1">
              <div className="form-group">
                <input
                  type="password"
                  className="trans-form"
                  placeholder="Enter a NEO private key"
                  ref={node => (wif = node)}
                />
              </div>
              <hr className="purple" />
            </div>

              <div className="go-icon"
                onClick={e => onWifChange(dispatch, history, wif)}
              />
            </div>
            <br />

        <p className="center top-20 col-xs-10 col-xs-offset-1">
          Your private key is never shared and is only used to load your balance and transaction history from the blockchain. Once entered, you can create an encrypted backup on your computer. You can still use your private key with other wallets.
        </p>
        </div>
      </div>
    </div>
</div>

<div className="dash-bar top-50">
  <Link to="/create">
  <div className="dash-icon-bar">
    <div className="icon-border">
      <span className="glyphicon glyphicon-star"></span>
    </div>
    Create a Neo Address
  </div>
  </Link>
  <Link to="/LoginLocalStorage">
  <div className="dash-icon-bar">
    <div className="icon-border">
      <span className="glyphicon glyphicon-lock"></span>
    </div>
    Login Via Saved Wallet
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
);

const mapStateToProps = state => ({
  loggedIn: state.account.loggedIn,
  wif: state.account.wif
});

LoginPrivateKey = connect(mapStateToProps)(LoginPrivateKey);

export default LoginPrivateKey;
