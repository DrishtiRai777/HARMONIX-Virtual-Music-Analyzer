import { NavLink } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-black text-white px-8 py-4 flex justify-between items-center shadow-md fixed top-0 w-full">
      {/* Logo */}
      <div>
        {/* <img src="/logo.png" alt="" className="h-16" /> */}
        <h1 className="font-kolker text-4xl">HX</h1><br />
        <p className="-mt-7 -ml-2 font-zain font-bold text-sm text-sky-400">HarmoniX</p>
      </div>   

      {/* Contact Button */}
      <div className="flex space-x-10">
      <NavLink to="/" className="flex items-center justify-center">
        <img src="/home.png" alt="Home" className="w-6 h-6" />
      </NavLink>


        <NavLink
          to="/contact"
          className="bg-blue-500 font-semibold text-white px-5 py-2 border-2 border-black rounded-lg hover:bg-blue-600"
        >
          Contact Us
        </NavLink>
      </div>
    </nav>
  );
};

export default Navbar;
