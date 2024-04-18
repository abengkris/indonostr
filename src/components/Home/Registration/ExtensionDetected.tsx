export const ExtensionDetected = ({
  onAccept,
  onReject,
  disabled,
}: {
  onAccept: VoidFunction;
  onReject: VoidFunction;
  disabled: boolean;
}) => {
  return (
    <div className="box nip07-extension">
      Ekstensi browser terdeteksi nih.
      <br />
      Mau isi pubkey pakai ekstensi?
      <button disabled={disabled} onClick={onAccept}>
        Iya
      </button>
      <button disabled={disabled} className="secondary" onClick={onReject}>
        Nggak
      </button>
    </div>
  );
};
