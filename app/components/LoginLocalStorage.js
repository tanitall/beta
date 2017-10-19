import React, { Component } from "react";
import { connect } from "react-redux";
import { Link, browserHistory } from "react-router";
import { login, decrypting, setKeys } from "../modules/account";
import CreateWallet from "./CreateWallet.js";
import { encrypt_wif, decrypt_wif } from "neon-js";
import storage from "electron-json-storage";
import _ from "lodash";
// TODO: these event messages should be refactored from transactions
import { sendEvent, clearTransactionEvent } from "../modules/transactions";
import Logo from "./Brand/LogoBlank";

const logo = require("../images/neon-logo2.png");

let wif_input;
let passphrase_input;

const onWifChange = (dispatch, history) => {
  if (passphrase_input.value.length < 4) {
    dispatch(sendEvent(false, "Passphrase too short"));
    setTimeout(() => dispatch(clearTransactionEvent()), 5000);
    return;
  }
  dispatch(sendEvent(true, "Decrypting encoded key..."));
  setTimeout(() => {
    decrypt_wif(wif_input.value, passphrase_input.value)
      .then(wif => {
        dispatch(login(wif));
        history.push("/dashboard");
        dispatch(clearTransactionEvent());
      })
      .catch(() => {
        dispatch(sendEvent(false, "Wrong passphrase"));
        setTimeout(() => dispatch(clearTransactionEvent()), 5000);
      });
  }, 500);
};

const { dialog } = require("electron").remote;
const loadKeyRecovery = dispatch => {
  dialog.showOpenDialog(fileNames => {
    // fileNames is an array that contains all the selected
    if (fileNames === undefined) {
      console.log("No file selected");
      return;
    }
    const filepath = fileNames[0];
    fs.readFile(filepath, "utf-8", (err, data) => {
      if (err) {
        alert("An error ocurred reading the file :" + err.message);
        return;
      }
      const keys = JSON.parse(data);
      storage.get("keys", (error, data) => {
        _.each(keys, (value, key) => {
          data[key] = value;
        });
        dispatch(setKeys(data));
        storage.set("keys", data);
      });
      // dispatch(setKeys(keys));
      // storage.set('keys', keys);
    });
  });
};

class LoginLocalStorage extends Component {
  componentDidMount = () => {
    storage.get("keys", (error, data) => {
      this.props.dispatch(setKeys(data));
    });
  };

  render = () => {
    const dispatch = this.props.dispatch;
    const loggedIn = this.props.loggedIn;
    return (
      <div id="savedWallet" className="container">
        <div className="login">
          <div className="row">
            <div className="col-xs-4 col-xs-offset-5">
              <Logo width={140} />
            </div>
          </div>

          <div className="row">
            <div className="col-xs-10 col-xs-offset-1">
              <div>
                <h1
                  style={{
                    color: "white",
                    textAlign: "center",
                    marginBottom: 30
                  }}
                >
                  Welcome to Morpheus
                </h1>
              </div>
              <div className="row inputs">
                <div className="col-xs-9 col-xs-offset-1">
                  <input
                    className="trans-form"
                    type="password"
                    placeholder="Enter your password"
                    ref={node => (passphrase_input = node)}
                  />
                </div>

                <div className="col-xs-12">
                  <hr className="purple" />
                </div>

                <div className="col-xs-8 col-xs-offset-1 ">
                  <div className="sel sel--black-panther">
                    <select
                      name="select-profession"
                      id="select-profession"
                      className="trans-form"
                      ref={node => (wif_input = node)}
                    >
                      <option selected="selected" disabled="disabled">
                        Select a wallet from backup
                      </option>
                      {_.map(this.props.accountKeys, (value, key) => (
                        <option value={value}>{key}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-xs-3">
                  <div className="">
                    {Object.keys(this.props.accountKeys).length === 0 ? (
                      <button
                        style={{
                          width: "100%"
                        }}
                        className="btn-send-gas"
                      >
                        Login
                      </button>
                    ) : (
                      <button
                        style={{
                          width: "100%"
                        }}
                        className="btn-send-gas"
                        onClick={e => onWifChange(dispatch, this.props.history)}
                      >
                        Login
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="icon-bar">
              <Link to="/create">
                <div className="icon-cell">
                  <div className="new-icon" />
                  Create New Wallet
                </div>
              </Link>
              <Link to="/">
                <div className="icon-cell">
                  <div className="lock-icon" />
                  Login Using Private Key
                </div>
              </Link>
              <Link to="/settings">
                <div
                  className="icon-cell"
                  onClick={() => loadKeyRecovery(this.props.dispatch)}
                >
                  <div className="upload-icon" />
                  Upload Recovery File
                </div>
              </Link>
            </div>
          </div>

          <div className="" />

          {this.props.decrypting === true ? (
            <div className="decrypting">Decrypting keys...</div>
          ) : (
            <div />
          )}
        </div>
      </div>
    );
  };
}

const mapStateToProps = state => ({
  loggedIn: state.account.loggedIn,
  wif: state.account.wif,
  decrypting: state.account.decrypting,
  accountKeys: state.account.accountKeys
});

LoginLocalStorage = connect(mapStateToProps)(LoginLocalStorage);

export default LoginLocalStorage;
