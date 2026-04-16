export default function Footer() {
  return (
    <footer
      style={{
        background: "var(--dark-mid)",
        padding: "26px 48px",
        textAlign: "center",
      }}
    >
      <p
        className="font-script"
        style={{
          fontSize: 28,
          color: "var(--white)",
          lineHeight: 1,
          marginBottom: 12,
        }}
      >
        Kaia &amp; Richard
      </p>
      <p
        className="font-sans"
        style={{
          fontSize: 10,
          letterSpacing: "0.35em",
          textTransform: "uppercase",
          color: "var(--mauve-light)",
        }}
      >
        July 8, 2027
      </p>
    </footer>
  );
}
