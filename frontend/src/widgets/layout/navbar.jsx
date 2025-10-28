import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import {
  Navbar as MTNavbar,
  Collapse,
  Typography,
  IconButton,
} from "@material-tailwind/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

export function Navbar({ routes }) {
  const [openNav, setOpenNav] = React.useState(false);

  React.useEffect(() => {
    window.addEventListener(
      "resize",
      () => window.innerWidth >= 960 && setOpenNav(false)
    );
  }, []);

  const navList = (
    <ul className="mb-4 mt-2 flex flex-col gap-2 text-inherit lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-6">
      {routes.map(({ name, path, icon, href, target }) => (
        <Typography
          key={name}
          as="li"
          variant="small"
          color="inherit"
          className="capitalize"
        >
          {href ? (
            <a
              href={href}
              target={target}
              className="flex items-center gap-1 p-1 font-bold"
            >
              {icon &&
                React.createElement(icon, {
                  className: "w-[18px] h-[18px] opacity-75 mr-1",
                })}
              {name}
            </a>
          ) : (
            <Link
              to={path}
              target={target}
              className="flex items-center gap-1 p-1 font-bold"
            >
              {icon &&
                React.createElement(icon, {
                  className: "w-[18px] h-[18px] opacity-75 mr-1",
                })}
              {name}
            </Link>
          )}
        </Typography>
      ))}
    </ul>
  );

  return (
    <MTNavbar color="transparent" className="p-3">
      {/* Utilisation de relative pour positionner le logo en absolute */}
      <div className="container mx-auto flex items-center justify-between text-white relative">
        
        {/* LOGO positionné à gauche */}
        <Link to="/" className="absolute left-0 py-1.5 ml-2">
          <img 
            src="/img/logoclaire.png"
            alt="Logo Claire"
            className="h-8 w-auto"
          />
        </Link>
        
        {/* navList centré sur les grands écrans (lg:justify-center) */}
        <div className="hidden lg:flex lg:w-full lg:justify-center">
          {navList}
        </div>
        
        {/* Espace pour le coin droit (vide) */}
        <div className="hidden gap-2 lg:flex">
          {/* Les boutons ont été supprimés ici */}
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