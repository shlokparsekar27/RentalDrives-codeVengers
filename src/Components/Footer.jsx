function Footer() {
  return (
    <footer style={{ 
      padding: "1rem", 
      background: "#222", 
      color: "#fff", 
      textAlign: "center",
      position: "fixed",  // This is the key change
      bottom: "0",        // This places the footer at the bottom
      width: "100%"       // This ensures the footer spans the full width
    }}>
      <p>© {new Date().getFullYear()} RentalDrives. All rights reserved.</p>
    </footer>
  );
}

export default Footer;
