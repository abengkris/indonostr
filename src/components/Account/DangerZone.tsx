import type { Event as NostrEvent } from "nostr-tools";
import { useState } from "react";
import { createPortal } from "react-dom";

import { signEvent } from "../../utils";

const USER_DELETE_API_URL = "/api/user-delete";

const deleteUser = async (signedEvent: NostrEvent) => {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ signedEvent }),
  };
  const response = await fetch(USER_DELETE_API_URL, options);
  const json = await response.json();
  return json;
};

export const DangerZone = ({ username }: { username: string }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [deleteButtonDisabled, setDeleteButtonDisabled] = useState(true);
  const [deleteInputValue, setDeleteInputValue] = useState("");
  const deletionConfirmText = `delete ${username}`;

  const checkDeletionConfirmed = (input: string) => {
    setDeleteInputValue(input);
    setDeleteButtonDisabled(input !== deletionConfirmText);
    return input === deletionConfirmText;
  };

  const handleDelete = async () => {
    if (checkDeletionConfirmed(deleteInputValue)) {
      const signedEvent = await signEvent("Delete my account");

      if (signedEvent) {
        const userUpdateResponse = await deleteUser(signedEvent);

        if (userUpdateResponse.success) {
          document.location.href = "/";
        }
      }
    }
  };

  return (
    <>
      <section className="box danger-zone">
        <div className="danger">ZONA BERBAHAYA</div>
        <p>Hapus akun saya dan semua data terkait.</p>
        <button onClick={() => setShowDeleteModal(true)}>HAPUS</button>
      </section>
      {showDeleteModal &&
        createPortal(
          <div className="modal-wrapper">
            <div className="box modal-delete-account">
              <button
                className="secondary close"
                onClick={() => {
                  setDeleteButtonDisabled(true);
                  setDeleteInputValue("");
                  setShowDeleteModal(false);
                }}
              >
                &times;
              </button>

              <div className="danger">
                Peringatan! Yakin kamu mau hapus akun?
              </div>
              <p>
              Saat kamu melanjutkan, semua data kamu akan dihapus dan kamu akan dialihkan ke halaman beranda.
              </p>
              <p>
                Ketik "<strong>{deletionConfirmText}</strong>" untuk memproses penghapusan.
              </p>
              <input
                type="text"
                value={deleteInputValue}
                onChange={(event) => checkDeletionConfirmed(event.target.value)}
                autoFocus
              />
              <button
                className="delete"
                disabled={deleteButtonDisabled}
                onClick={handleDelete}
              >
                Saya paham, hapus akun saya
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
