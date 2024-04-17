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
      Ekstensi browser terdeteksi.
      <br />
      Isi kunci publik?
      <button disabled={disabled} onClick={onAccept}>
        Iya
      </button>
      <button disabled={disabled} className="secondary" onClick={onReject}>
        Tidak
      </button>
    </div>
  );
};
