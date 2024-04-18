import { nip19 } from "nostr-tools";
import { ChangeEvent, useState } from "react";

import { useRegisteredUsers } from "../../../hooks";
import { checkUsername } from "../../../utils";

import { ExtensionDetected } from "./ExtensionDetected";
import { RegistrationSuccess } from "./RegistrationSuccess";
import { Toggle } from "./Toggle";

type RegistrationFormProps = {
  disabled: boolean;
  host: string;
};

const REGISTER_API_URL = "/api/user-create";

const isNpub = (value: string) => value.startsWith("npub");

const convertNpubToHex = (npub: string) => {
  try {
    const hexKeyObj = nip19.decode(npub);
    return hexKeyObj.data as string;
  } catch (error) {
    return false;
  }
};

const submitForm = async (
  username: string,
  pubkey: string,
  lightningAddress: string
) => {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, pubkey, lightningAddress }),
  };
  const response = await fetch(REGISTER_API_URL, options);
  const json = await response.json();
  return json;
};

export const RegistrationForm = ({ disabled, host }: RegistrationFormProps) => {
  const users = useRegisteredUsers();

  const [username, setUsername] = useState("");

  const [pubkey, setPubkey] = useState("");
  const [pubkeyHex, setPubkeyHex] = useState("");

  const [lightningAddress, setLightningAddress] = useState("");
  const [lightningAddressEnabled, setLightningAddressEnabled] = useState(false);

  const [formError, setFormError] = useState<boolean | string>(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submittedUsername, setSubmittedUsername] = useState("");

  // console.log({ username, pubkey, pubkeyHex });

  const [extensionBoxVisible, setExtensionBoxVisible] = useState(
    !!window.nostr
  );

  const formDisabled = !users || disabled;
  const hasUsername = username.length > 0;
  const hasPubkey = pubkeyHex.length > 0;

  const showFormResult = !!formError || !!formSubmitted;

  const checkPubkey = (pubkey: string) => {
    if (!users) return "Nggak bisa nemuin pengguna";

    if (pubkey.length === 0) {
      return false;
    }

    const pubkeyFormatNpub = /^npub[0-3][qpzry9x8gf2tvdw0s3jn54khce6mua7l]+/;
    const pubkeyFormatHex = /^[0-9a-f]{64}$/g;

    if (isNpub(pubkey)) {
      const isPubkeyValidNpub = pubkeyFormatNpub.test(pubkey);

      if (!isPubkeyValidNpub) {
        return "Kunci publik npub nggak valid nih.";
      } else {
        const hexKey = convertNpubToHex(pubkey);

        if (!hexKey) {
          return "Kunci publik npub nggak valid nih.";
        } else if (Object.values(users).includes(hexKey)) {
          return "Maaf banget, kunci pub ini udah ada yang pakai.";
        }

        return false;
      }
    } else {
      const isPubkeyValidHex = pubkeyFormatHex.test(pubkey);

      if (!isPubkeyValidHex) {
        return "Kunci publik npub nggak valid nih.";
      } else if (Object.values(users).includes(pubkey)) {
        return "Maaf banget, kunci pub ini udah ada yang pakai.";
      }

      return false;
    }
  };

  const handleInput = (
    field: "username" | "pubkey" | "lightningAddress",
    event: ChangeEvent<HTMLInputElement>
  ) => {
    // sanitize input
    const inputValue = event.target.value.toLowerCase();

    // update values
    if (field === "username") setUsername(inputValue);
    else if (field === "pubkey") setPubkey(inputValue);
    else if (field === "lightningAddress") {
      setLightningAddress(inputValue);
    }

    if (field === "username") {
      // check username
      const usernameError = checkUsername(
        field === "username" ? inputValue : username,
        users
      );
      if (usernameError) {
        setFormError(usernameError);
        return;
      }
    }

    if (field === "pubkey") {
      // check pubkey
      const pubkeyError = checkPubkey(inputValue);
      if (pubkeyError) {
        setFormError(pubkeyError);
        return;
      }

      // if there is no error, we set the pubkeyHex
      else {
        if (isNpub(inputValue)) {
          try {
            const hexKeyObj = nip19.decode(inputValue);
            const hexKey = hexKeyObj.data as string;
            setPubkeyHex(hexKey);
          } catch (error) {
            setFormError("Kunci publik npub nggak valid nih.");
          }
        } else {
          setPubkeyHex(inputValue);
        }
      }
    }

    // hide error message if everything looks good
    setFormError(false);
  };

  const handleRegistration = () => {
    if (hasUsername && hasPubkey) {
      submitForm(username, pubkeyHex, lightningAddress).then((response) => {
        if (response.success) {
          setSubmittedUsername(username);
          setUsername("");
          setPubkey("");
          setLightningAddress("");
          setFormSubmitted(true);
        }
      });
    }
  };

  return (
    <>
      {extensionBoxVisible && (
        <ExtensionDetected
          onAccept={() => {
            window.nostr.getPublicKey().then((hexKey: string) => {
              setPubkey(hexKey);
              setPubkeyHex(hexKey);
              setExtensionBoxVisible(false);

              const pubkeyError = checkPubkey(hexKey);
              if (pubkeyError) {
                setFormError(pubkeyError);
              }
            });
          }}
          onReject={() => {
            setExtensionBoxVisible(false);
          }}
          disabled={formDisabled || formSubmitted}
        />
      )}
      <form className="box user-form">
        <div>
          <input
            type="text"
            placeholder={!users ? "tunggu bentar ya…" : "public key"}
            maxLength={64}
            disabled={formDisabled || formSubmitted}
            value={pubkey}
            onChange={(event) => handleInput("pubkey", event)}
          />
        </div>

        <div className="address">
          <input
            type="text"
            placeholder={!users ? "tunggu bentar ya…" : "username"}
            maxLength={64}
            disabled={formDisabled || formSubmitted}
            value={username}
            onChange={(event) => handleInput("username", event)}
          />
          <label>
            <strong>@{host}</strong>
          </label>
        </div>

        <div>
          <Toggle
            id="lightning-address-redirect"
            label="Mau jadiin alamat lightning juga?"
            isOn={lightningAddressEnabled}
            onChange={(event) =>
              setLightningAddressEnabled(event.target.checked)
            }
          />
        </div>

        {lightningAddressEnabled && (
          <>
            <div>
              <small>
                <div>
                Masukkin alamat <i>lightning</i> kamu yang ada untuk mengaktifkan pengalihan.
                </div>
                <div>
                Nanti bisa pakai alamat nama-kamu@indonostr.xyz kamu sebagai alamat <i>lightning</i>.
                </div>
              </small>
            </div>
            <div>
              <input
                type="text"
                placeholder={
                  !users ? "tunggu bentar ya…" : "abeng@zbd.gg"
                }
                maxLength={64}
                disabled={formDisabled || formSubmitted}
                value={lightningAddress}
                onChange={(event) => handleInput("lightningAddress", event)}
              />
            </div>
          </>
        )}

        <div>
          <button
            type="button"
            disabled={
              formDisabled ||
              formSubmitted ||
              !!formError ||
              !hasUsername ||
              !hasPubkey
            }
            onClick={handleRegistration}
          >
            daftar
          </button>
        </div>
      </form>

      {showFormResult && (
        <div className="box registration-result">
          {formError && <div className="error">{formError}</div>}
          {formSubmitted && (
            <RegistrationSuccess username={submittedUsername} host={host} />
          )}
        </div>
      )}
    </>
  );
};
