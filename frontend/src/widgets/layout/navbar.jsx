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
              variant={path === "/sign-up" ? "gradient" : "text"}
              size="sm"
              color={path === "/sign-up" ? "blue" : "white"}
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
    <MTNavbar color="white" className="p-3 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between relative">
        {/* LOGO */}
        <Link to="/" className="py-1.5">
          <img 
            src="/img/logoclaire.png"
            alt="Logo Claire"
            className="h-8 w-auto"
          />
        </Link>
        
        {/* Navigation principale */}
        <div className="hidden lg:flex lg:items-center lg:gap-6">
          {navList}
        </div>
        
        {/* Bouton hamburger */}
        <IconButton
          variant="text"
          size="sm"
          color="white"
          className="ml-auto text-inherit hover:bg-transparent focus:bg-transparent active:bg-transparent lg:hidden z-10"
          onClick={() => setOpenNav(!openNav)}
        >
          {openNav ? (
            <XMarkIcon strokeWidth={2} className="h-6 w-6" />
          ) : (
            <Bars3Icon strokeWidth={2} className="h-6 w-6" />
          )}
        </IconButton>
      </div>
      
      {/* ✅ Remplacement de MobileNav par Collapse */}
      <Collapse open={openNav}>
        <div className="container mx-auto">
          <div className="rounded-xl bg-white px-4 pt-2 pb-4 text-blue-gray-900">
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