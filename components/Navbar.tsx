import { Box } from "lucide-react";
import React from "react";
import Button from "./ui/Button";
import { useOutletContext } from "react-router";

interface NavLink {
  id: number;
  label: string;
  href: string;
}

const Navbar = () => {
  const { isSignedIn, userName, signIn, signOut, refreshAuth } =
    useOutletContext<AuthContext>();
  const links: NavLink[] = [
    { id: 1, label: "Product", href: "#product" },
    { id: 2, label: "Pricing", href: "#pricing" },
    { id: 3, label: "Community", href: "#community" },
    { id: 4, label: "Enterprise", href: "#enterprise" },
  ];

  //handle auth click functionality
  const handleAuthClick = async () => {
    if (isSignedIn) {
      try {
        await signOut();
      } catch (error) {
        console.error("Error signing out:", error);
      }
    }
    try {
      await signIn();
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  return (
    <header className="navbar">
      <nav className="inner">
        <div className="left">
          <div className="brand">
            <Box className="logo" />
            <span className="name">Roomify</span>
          </div>
          <ul className="links">
            {links.map((link: NavLink) => (
              <a key={link.id} href={link.href}>
                {link.label}
              </a>
            ))}
          </ul>
        </div>
        <div className="actions">
          {isSignedIn ? (
            <>
              <span className="greeting">
                {userName ? `Hi, ${userName}` : "Hi, User"}
              </span>
              <Button size="sm" onClick={handleAuthClick}>
                log Out
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="ghost" onClick={handleAuthClick}>
                log In
              </Button>
              <a href="#upload" className="cta">
                Get Started
              </a>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
