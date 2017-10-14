import React, { Component } from "react";
import { Link } from "react-router";
// import QRCode from "qrcode";
import { clipboard } from "electron";
import Copy from "react-icons/lib/md/content-copy";
import ReactTooltip from "react-tooltip";
import storage from "electron-json-storage";
import { resetKey } from "../modules/generateWallet";
import { connect } from "react-redux";
import { sendEvent, clearTransactionEvent } from "../modules/transactions";
import { login } from "../modules/account";
import { getWIFFromPrivateKey } from "neon-js";
import { encrypt_wif, decrypt_wif } from "neon-js";
import { getAccountsFromWIFKey } from "neon-js";
import Logo from "./Brand/LogoBlank";
import PrivateView from "./DisplayPrivateKeys";
var QRCode = require("qrcode.react");

let key_name;
let wif;

const saveKey = async (dispatch, encWifValue, history) => {
  await storage.get("keys", async (error, data) => {
    data[key_name.value] = encWifValue;
    dispatch(sendEvent(true, "Saved key as " + key_name.value));
    await storage.set("keys", data);
    await setTimeout(() => dispatch(clearTransactionEvent()), 5000);
    setTimeout(() => history.push("/loginLocalStorage"), 5000);
  });
};

const saveKeyRecovery = keys => {
  const content = JSON.stringify(keys);
  dialog.showSaveDialog(
    {
      filters: [
        {
          name: "JSON",
          extensions: ["json"]
        }
      ]
    },
    fileName => {
      if (fileName === undefined) {
        console.log("File failed to save...");
        return;
      }
      // fileName is a string that contains the path and filename created in the save file dialog.
      fs.writeFile(fileName, content, err => {
        if (err) {
          alert("An error ocurred creating the file " + err.message);
        }
        alert("The file has been succesfully saved");
      });
    }
  );
};

const resetGeneratedKey = dispatch => {
  dispatch(resetKey());
};

class DisplayWalletKeys extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      isChecked: true
    };
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }
  render = () => {
    if (this.state.show === true) {
      return (
        <PrivateView
          history={this.props.history}
          address={this.props.address}
          wif={this.props.wif}
          passphrase={this.props.passphrase}
          passphraseKey={this.props.passphraseKey}
        />
      );
    }
    return (
      <div id="displayWalletKeys">
        <div className="container">
          <div className="row">
            <div className="col-xs-4 col-xs-offset-5">
              <Logo width={140} />
            </div>
          </div>

          <div className="col-xs-10 col-xs-offset-1">
            <div className="info">
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

            <p className="welcome">
              Congratulations! New NEO Address & Private Key Created
            </p>
          </div>

          <div className="row" id="buttons">
            <div className="col-xs-10 col-xs-offset-1">
              <div className="row">
                <div className="col-xs-3">
                  <button onClick={() => print()} className=" btn-send">
                    Print a Backup
                  </button>
                </div>

                <div className="col-xs-3">
                  <button
                    onClick={() => {
                      this.setState({ show: true });
                    }}
                    className="btn-blue"
                  >
                    View Your Private Data
                  </button>
                </div>

                <div className="col-xs-3">
                  <button className="btn-export">Export Private Key</button>
                </div>
                <div className="col-xs-3">
                  <button className="btn-send">Verify Address</button>
                </div>
              </div>
            </div>
          </div>
          {/* qr */}
          <div className="col-xs-10 col-xs-offset-1" style={{ marginTop: 10 }}>
            <div className="row">
              <div className="col-xs-3">
                <div className="addressBox">
                  <QRCode value={this.props.address} />,
                </div>
              </div>
              <div className="col-xs-9">
                <div className="keyList">
                  <div className="form-group">
                    <p className="key-label">Your Public NEO Address</p>
                    <input
                      type="text"
                      onClick={() => clipboard.writeText(this.props.address)}
                      className="form-control pubicAddress"
                      contentEditable={false}
                      readOnly={true}
                      value={this.props.address}
                      data-tip
                      data-for="copyPublicKeyTip"
                    />
                  </div>

                  <div className="form-group">
                    <p className="key-label">Your Secure Password</p>
                    <input
                      type="text"
                      onClick={() => clipboard.writeText(this.props.passphrase)}
                      className="form-control"
                      contentEditable={false}
                      readOnly={true}
                      value={this.props.passphrase}
                      data-tip
                      data-for="copyPassphraseTip"
                      onClick={() => clipboard.writeText(this.props.passphrase)}
                    />
                  </div>
                </div>
                <div className="saveKey">
                  {/* <input
                type="text"
                placeholder="Name this key"
                ref={node => (key_name = node)}
              />
              <button
                onClick={() =>
                  saveKey(this.props.dispatch, this.props.passphraseKey)}
              >
                Save Key
              </button> */}
                </div>
                {/* <Link
                onClick={() => resetGeneratedKey(this.props.dispatch)}
                to="/create"
              >
                <button className="btn btn-form btn-mini">Back</button>
              </Link> */}
                <ReactTooltip
                  class="solidTip"
                  id="copyPublicKeyTip"
                  place="bottom"
                  type="dark"
                  effect="solid"
                >
                  <span>Copy Public Key</span>
                </ReactTooltip>
                <ReactTooltip
                  class="solidTip"
                  id="copyPrivateKeyTip"
                  place="bottom"
                  type="dark"
                  effect="solid"
                >
                  <span>Copy Private Key</span>
                </ReactTooltip>
                <ReactTooltip
                  class="solidTip"
                  id="copyPassphraseTip"
                  place="bottom"
                  type="dark"
                  effect="solid"
                >
                  <span>Copy Passphrase</span>
                </ReactTooltip>
                <ReactTooltip
                  class="solidTip"
                  id="copyPassphraseKeyTip"
                  place="bottom"
                  type="dark"
                  effect="solid"
                >
                  <span>Copy Passphrase Encrypted Key</span>
                </ReactTooltip>
              </div>
              <div className="col-xs-8">
                <div className="form-group">
                  <input
                    type="text"
                    className="form-control saveKey"
                    ref={node => (key_name = node)}
                    placeholder="Name your Backup/Recovery Key"
                    data-tip
                  />
                </div>
              </div>
              <div className="col-xs-4" style={{ margin: 0, padding: 0 }}>
                <button
                  onClick={() =>
                    saveKey(
                      this.props.dispatch,
                      this.props.passphraseKey,
                      this.props.history
                    )}
                  className="btn-red"
                >
                  Backup Wallet & Continue
                </button>

                {this.props.decrypting === true ? (
                  <div className="decrypting">Decrypting keys...</div>
                ) : (
                  <div />
                )}
                <label class="checkbox-inline" style={{ color: "white" }}>
                  I have backed up my private data
                </label>
                <input
                  id="checkbox"
                  name="isChecked"
                  type="checkbox"
                  className="pull-left"
                  value={this.state.isChecked}
                  onChange={this.handleInputChange.bind(this)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="disclaimer">
          <p className="disclaimer">
            Please ensure you backup your Private Key and Secret Phrase. It will
            never be shown to you again and we can not help you retrieve it if
            lost. Your Private Key is encrypted on your computer is <u>never</u>{" "}
            shared or stored online by Morpheus. Learn More
          </p>
        </div>
      </div>
    );
  };
}
const mapStateToProps = state => ({});

DisplayWalletKeys = connect(mapStateToProps)(DisplayWalletKeys);

export default DisplayWalletKeys;
