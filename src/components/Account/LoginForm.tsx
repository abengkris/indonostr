import type { Event as NostrEvent } from "nostr-tools";
import { useState } from "react";

import { signEvent } from "../../utils";

export type UserData = {
  lightningAddress: string;
  pubkey: string;
  registeredAt: string;
  username: string;
};

type UserDataResponse = {
  success: boolean;
  data: UserData;
};

type LoginFormProps = {
  onLogin: (response: UserDataResponse) => void;
};

const USER_READ_API_URL = "/api/user-read";

const loginUser = async (signedEvent: NostrEvent) => {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ signedEvent }),
  };
  const response = await fetch(USER_READ_API_URL, options);
  const json = await response.json();
  return json;
};

export const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [loginFailed, setLoginFailed] = useState(false);

  const handleClick = async () => {
    const signedEvent = await signEvent("Login");
    if (signedEvent) {
      const loginResponse = await loginUser(signedEvent);

      if (loginResponse.success === true) {
        onLogin(loginResponse);
      } else {
        setLoginFailed(true);
      }
    }
  };

  return (
    <>
      <section className="box">
        <strong>Selamat datang kembali, IndoNostr People!</strong>
        <p>Masuk dengan ekstensi browser yang kompatibel dengan NIP-07.</p>
        <button onClick={handleClick}>Login</button>
      </section>

      {loginFailed && (
        <section className="box login-error">
          <div className="error">
          Gagal masuk! Tidak ditemukan pengguna dengan kunci pub Anda.
          </div>
          <div>
            Apakah kamu ingin <a href="/">mendaftar</a>?
          </div>
        </section>
      )}
    </>
  );
};
