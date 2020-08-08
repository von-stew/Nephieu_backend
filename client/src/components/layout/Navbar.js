import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className='navbar bg-dark'>
      <h1>
        <Link to='/'>iNephieus</Link>
      </h1>
      <ul>
        <li>
          <a href='!#'>Developers</a>
        </li>
        <li>
          <Link to='/register'>Register</Link>
        </li>
        <li>
          <Link to='/Login'>Login</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
