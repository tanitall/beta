import React, { Component } from "react";
import { Link } from "react-router";
import QRCode from "qrcode";
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

const resetGeneratedKey = dispatch => {
  dispatch(resetKey());
};

class DisplayWalletKeys extends Component {
  componentDidMount = () => {
    console.log(this.props.history);
    QRCode.toCanvas(
      this.publicCanvas,
      this.props.address,
      { version: 5 },
      err => {
        if (err) console.log(err);
      }
    );
    QRCode.toCanvas(
      this.privateCanvas,
      this.props.passphraseKey,
      { version: 5 },
      err => {
        if (err) console.log(err);
      }
    );
  };

  render = () => (
    <div id="privateKeys">
      <div className="container">
        <div className="col-xs-10 col-xs-offset-1">
          <div className="row">
            <div className="col-xs-12">
              <h1 style={{ color: "white", fontSize: 36, textAlign: "center" }}>
                New NEO Address & Private Key Created
              </h1>
            </div>
          </div>
          <div className="row">
            <div className="col-xs-12">
              <p style={{ color: "white", textAlign: "center" }}>
                Please ensure you backup your Private Key and password. It
                will never be shown to you again and we can not help you
                retrieve it if lost. Your Private Key is encrypted on your
                computer is never shared or stored online by Morpheus.
              </p>
            </div>
          </div>

          <div className="row">
            <div className="col-xs-8">
              <input
                type="text"
                className="form-control saveKey"
                ref={node => (key_name = node)}
                placeholder="Name your Backup/Recovery Key"
                data-tip
              />
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
              <label className="checkbox-inline" style={{ color: "white" }}>
                I have backed up my private data
              </label>
              <input
                id="checkbox"
                name="isChecked"
                type="checkbox"
                className="pull-left"
              />
            </div>
          </div>

          <div className="row">
            <div className="col-xs-12">
              <div className="row">
                <div className="col-xs-3">
                  <div className="row">
                    <div className="col-xs-12">
                      <canvas
                        id="publicCanvas"
                        style={{
                          border: "10px solid #D3D3D3",
                          borderRadius: 30
                        }}
                        ref={node => (this.publicCanvas = node)}
                      />
                      <p style={{ textAlign: "center" }}>
                        Your Public QR Address
                      </p>
                    </div>
                  </div>
                </div>

                <div className="col-xs-9">
                  <div>
                    <div className="row">
                      <div className="col-xs-8">
                        <div className="keyList">
                          {/* public address */}
                          <div className="keyListItem">
                            <p className="key-label">
                              Your Public NEO Address:
                            </p>
                            <input
                              type="text"
                              onClick={() =>
                                clipboard.writeText(this.props.address)}
                              className="form-control pubicAddress"
                              contentEditable={false}
                              readOnly={true}
                              value={this.props.address}
                              data-tip
                              data-for="copyPublicKeyTip"
                            />
                          </div>
                          {/* public address */}
                          {/* secrect phrase */}
                          <div className="keyListItem">
                            <p className="key-label">Your Secret Phrase:</p>
                            <input
                              type="text"
                              onClick={() =>
                                clipboard.writeText(this.props.passphrase)}
                              className="form-control"
                              contentEditable={false}
                              readOnly={true}
                              value={this.props.passphrase}
                              data-tip
                              data-for="copyPassphraseTip"
                              onClick={() =>
                                clipboard.writeText(this.props.passphrase)}
                            />
                          </div>
                          {/* secrect phrase */}
                        </div>

                        <ReactTooltip
                          className="solidTip"
                          id="copyPublicKeyTip"
                          place="bottom"
                          type="dark"
                          effect="solid"
                        >
                          <span>Copy Public Key</span>
                        </ReactTooltip>
                        <ReactTooltip
                          className="solidTip"
                          id="copyPrivateKeyTip"
                          place="bottom"
                          type="dark"
                          effect="solid"
                        >
                          <span>Copy Private Key</span>
                        </ReactTooltip>
                        <ReactTooltip
                          className="solidTip"
                          id="copyPassphraseTip"
                          place="bottom"
                          type="dark"
                          effect="solid"
                        >
                          <span>Copy Passphrase</span>
                        </ReactTooltip>
                        <ReactTooltip
                          className="solidTip"
                          id="copyPassphraseKeyTip"
                          place="bottom"
                          type="dark"
                          effect="solid"
                        >
                          <span>Copy Passphrase Encrypted Key</span>
                        </ReactTooltip>
                      </div>
                      <div className="col-xs-4">
                        <div className="addressBox">
                          <canvas
                            id="privateCanvas"
                            height={212}
                            width={212}
                            style={{
                              border: "10px solid #D3D3D3",
                              borderRadius: 30,
                              height: "212px !important",
                              width: "212px !important"
                            }}
                            ref={node => (this.privateCanvas = node)}
                          />

                          <p style={{ textAlign: "center" }}>
                            Your Encrypted Private Key
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="private">
              <div className="keyList">

              {/* Your Encrypted Private Key*/}
              <div className="col-xs-6">
                <p className="key-label">Your Private Key:</p>
                <input
                  type="text"
                  onClick={() => clipboard.writeText(this.props.wif)}
                  className="form-control"
                  contentEditable={false}
                  readOnly={true}
                  value={this.props.wif}
                  data-tip
                  data-for="copyPrivateKeyTip"
                />
              </div>

                {/* Your Encrypted Private Key*/}
                <div className="col-xs-6">
                  <p className="key-label">Your Encrypted Private Key:</p>
                  <input
                    type="text"
                    onClick={() => clipboard.writeText(this.props.address)}
                    className="form-control"
                    contentEditable={false}
                    readOnly={true}
                    value={this.props.passphraseKey}
                    data-tip
                    data-for="copyPassphraseKeyTip"
                  />
                </div>

              </div>
            </div>
          </div>

          <div className="row" style={{ marginTop: 30 }}>
            <div className="button-group">
              <div className="col-xs-4">
                <button onClick={() => print()} className="btn-blue">
                  Print Paper Wallet
                </button>
              </div>
              <div className="col-xs-4">
                <button className="btn-export">Export Private Key</button>
              </div>
              <div className="col-xs-4">
                <Link
                  onClick={() => resetGeneratedKey(this.props.dispatch)}
                  to="/"
                >
                  <button className="btn-send-gas">Go Back</button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
const mapStateToProps = state => ({});

DisplayWalletKeys = connect(mapStateToProps)(DisplayWalletKeys);

export default DisplayWalletKeys;
