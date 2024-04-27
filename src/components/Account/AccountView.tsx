import { format } from "date-fns";
import type { Event as NostrEvent } from "nostr-tools";
import { ChangeEvent, useState } from "react";

import { useRegisteredUsers } from "../../hooks";
import { checkUsername, signEvent } from "../../utils";

import { DangerZone } from "./DangerZone";
import { ExtensionNotFound } from "./ExtensionNotFound";
import { LoginForm } from "./LoginForm";
import type { UserData } from "./LoginForm";

type AccountViewProps = {
  host: string;
};

const USER_UPDATE_API_URL = "/api/user-update";

const updateUser = async (signedEvent: NostrEvent) => {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ signedEvent }),
  };
  const response = await fetch(USER_UPDATE_API_URL, options);
  const json = await response.json();
  return json;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return format(date, "dd MMMM yyyy");
};

export const AccountView = ({ host }: AccountViewProps) => {
  const users = useRegisteredUsers();

  const extensionDetected = !!window.nostr;

  const [isAuthed, setIsAuthed] = useState(false);

  const [pubkey, setPubkey] = useState("");
  const [registedUsername, setRegisteredUsername] = useState("");
  const [username, setUsername] = useState("");
  const [registeredAt, setRegisteredAt] = useState("");
  const [lightningAddress, setLightningAddress] = useState("");

  const [formError, setFormError] = useState<boolean | string>(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const hasUsername = username.length > 0;

  const showFormResult = !!formError || !!formSubmitted;

  const handleInput = (
    field: "username" | "pubkey" | "lightningAddress",
    event: ChangeEvent<HTMLInputElement>
  ) => {
    // sanitize input
    const inputValue = event.target.value.toLowerCase();

    // update values
    if (field === "username") setUsername(inputValue);
    else if (field === "lightningAddress") {
      setLightningAddress(inputValue);
    }

    // check username
    const usernameError = checkUsername(
      field === "username" ? inputValue : username,
      users
    );

    if (usernameError && registedUsername !== inputValue) {
      setFormError(usernameError);
      return;
    }

    // hide error message if everything looks good
    setFormError(false);
  };

  const handleLogin = (response: {
    success: boolean;
    message?: string;
    data: UserData;
  }) => {
    const {
      data: { pubkey, username, registeredAt, lightningAddress },
    } = response;

    setPubkey(pubkey);
    setUsername(username);
    setRegisteredUsername(username);
    setRegisteredAt(registeredAt);

    if (lightningAddress) {
      setLightningAddress(lightningAddress);
    }

    setIsAuthed(true);
  };

  const handleSave = async () => {
    if (hasUsername) {
      const eventContent = JSON.stringify({ username, lightningAddress });
      const signedEvent = await signEvent(eventContent);

      if (signedEvent) {
        const userUpdateResponse = await updateUser(signedEvent);

        if (userUpdateResponse.success) {
          setFormSubmitted(true);
        }
      }
    }
  };

  if (!extensionDetected) {
    return <ExtensionNotFound />;
  }

  if (!isAuthed) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <>
      <form className="box user-form">
        <div className="user-form-header">
          <strong>Halo {registedUsername}!</strong>

          <p>
            <small>
              <span>{pubkey}</span>

              {registeredAt && (
                <>
                  <br />
                  <span>Terdaftar sejak {formatDate(registeredAt)}</span>
                </>
              )}
            </small>
          </p>
        </div>

        <div>Username kamu</div>

        <div className="address">
          <input
            type="text"
            placeholder="username"
            maxLength={64}
            value={username}
            onChange={(event) => handleInput("username", event)}
          />
          <label>
            <strong>@{host}</strong>
          </label>
        </div>

        <div>Lightning address kamu</div>
        <div>
          <small>
            <div>
              Masukin alamat <i>lightning address</i> kamu yang ada untuk mengaktifkan pengalihan.
            </div>
            <div>
            Kemudian kamu bisa pakai alamat nama-kamu@indonostr.xyz sebagai <i>lightning address</i>.
            </div>
            <div>Kosongkan kolom untuk menonaktifkan fitur.</div>
          </small>
        </div>
        <div>
          <input
            type="text"
            placeholder="janedoe69@walletofsatoshi.com"
            maxLength={64}
            value={lightningAddress}
            onChange={(event) => handleInput("lightningAddress", event)}
          />
        </div>

        <div>
          <button
            type="button"
            disabled={!!formError || !hasUsername}
            onClick={handleSave}
          >
            simpan
          </button>
        </div>
      </form>
      {showFormResult && (
        <div className="box user-update-result">
          {formError && <div className="error">{formError}</div>}
          {formSubmitted && <strong>Berhasil menyimpan!</strong>}
        </div>
      )}

      <DangerZone username={registedUsername} />
    </>
  );
};
