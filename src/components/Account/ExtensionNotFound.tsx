export const ExtensionNotFound = () => (
  <section className="box">
    <div className="error">Tidak ditemukan ekstensi browser yang kompatibel dengan NIP-07.</div>
    <div>
      Silahkan{" "}
      <a
        href="https://github.com/aljazceru/awesome-nostr#browser-extensions"
        target="_blank"
      >
        instal ekstensi favoritmu
      </a>{" "}
      dan segarkan halaman ini.
    </div>
  </section>
);
