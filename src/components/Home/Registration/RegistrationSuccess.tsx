import { CopyWrapper } from "../CopyWrapper";

type RegistrationSuccessProps = {
  username: string;
  host: string;
};

export const RegistrationSuccess = ({
  username,
  host,
}: RegistrationSuccessProps) => {
  const address = `${username}@${host}`;

  return (
    <div className="registration-success">
      <p>
        <strong>Yeay! kamu berhasil mendaftar!</strong>
      </p>
      <div>
        Ini adalah alamat nostr kamu sekarang:
        <CopyWrapper text={address} className="nip-05">
          <div className="box copy-box">
            <strong>{address}</strong>
            <button>
              <img src="images/copy-icon.svg" />
            </button>
          </div>
        </CopyWrapper>
      </div>
      <p>
        Salin alamat nostr baru kamu ke kolom <span className="text-gradient">NIP-05</span>{" "}
        di profil nostr kamu dan simpan.
      </p>
    </div>
  );
};
