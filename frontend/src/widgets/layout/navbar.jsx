import React from "react";
import PropTypes from "prop-types";
import { Link, useLocation } from "react-router-dom";
import {
  Navbar as MTNavbar,
  Collapse,
  Typography,
  IconButton,
  Button,
} from "@material-tailwind/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

import { mainNavigation } from "@/data/navigation-data";

export function Navbar() {
  const [openNav, setOpenNav] = React.useState(false);
  const location = useLocation();

  React.useEffect(() => {
    window.addEventListener(
      "resize",
      () => window.innerWidth >= 960 && setOpenNav(false)
    );
  }, []);

  const navList = (
    <ul className="mb-4 mt-2 flex flex-col gap-2 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-6">
      {mainNavigation.map(({ name, path }) => {
        const isAuthLink = path === "/sign-in" || path === "/sign-up";
        const isActive = location.pathname === path || (path.startsWith("#") && location.pathname === "/" && location.hash === path);
        
        if (isAuthLink) {
          return (
            <Button
              key={name}
              variant={path === "/sign-up" ? "filled" : "text"}
              size="sm"
              style={path === "/sign-up" ? { backgroundColor: "#9b0e16", color: "white" } : {}}
              className={path === "/sign-in" ? "text-gray-900" : ""}
            >
              <Link to={path} className="flex items-center gap-1">
                {name}
              </Link>
            </Button>
          );
        }

        return (
          <Typography
            key={name}
            as="li"
            variant="small"
            color="gray"
            className="capitalize"
          >
            <Link
              to={path}
              className={`flex items-center gap-1 p-1 font-medium transition-colors ${
                isActive ? "text-blue-500" : "hover:text-blue-500"
              }`}
              onClick={(e) => {
                if (path.startsWith("#")) {
                  e.preventDefault();
                  const element = document.querySelector(path);
                  if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                  }
                }
              }}
            >
              {name}
            </Link>
          </Typography>
        );
      })}
    </ul>
  );

  return (
    <MTNavbar 
      className="fixed top-0 left-0 right-0 z-50 rounded-none border-0 shadow-md w-full bg-white p-0"
      fullWidth
      blurred={false}
    >
      <div className="w-full flex items-center justify-between px-4 lg:px-8">
        {/* LOGO */}
        <Link to="/" className="py-2">
          <img 
            src="/img/logotwil.png"
            alt="Logo Claire"
            className="h-8 w-auto"
          />
        </Link>
        
        {/* Navigation principale */}
        <div className="hidden lg:flex lg:items-center lg:gap-8">
          {navList}
        </div>
        
        {/* Bouton hamburger */}
        <IconButton
          variant="text"
          size="sm"
          className="ml-auto text-gray-900 hover:bg-gray-100 focus:bg-transparent active:bg-transparent lg:hidden z-10"
          onClick={() => setOpenNav(!openNav)}
        >
          {openNav ? (
            <XMarkIcon strokeWidth={2} className="h-6 w-6" />
          ) : (
            <Bars3Icon strokeWidth={2} className="h-6 w-6" />
          )}
        </IconButton>
      </div>
      
      {/* Collapse pour mobile */}
      <Collapse open={openNav}>
        <div className="w-full bg-white">
          <div className="px-4 py-2 text-blue-gray-900">
            {navList}
          </div>
        </div>
      </Collapse>
    </MTNavbar>
  );
}

Navbar.propTypes = {
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

Navbar.displayName = "/src/widgets/layout/navbar.jsx";

export default Navbar;