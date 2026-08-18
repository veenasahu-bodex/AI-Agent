import { Link } from "react-router-dom";
import {
  FiBriefcase,
  FiHome,
} from "react-icons/fi";

import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">

      <Link
        to="/"
        className="navbar-logo"
      >
        <div className="logo-icon">
          <FiBriefcase />
        </div>

        <span>JobAgent</span>
      </Link>

      <div className="navbar-links">

        <Link to="/home">
          <FiHome />
          <span>Home</span>
        </Link>

      </div>

    </nav>
  );
}

export default Navbar;