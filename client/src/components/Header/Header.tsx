import React from 'react';
import { NavLink } from 'react-router-dom';

const Header: React.FC = () => {
	return (
		<ul className="flex gap-3 my-4">
			<NavLink to={'/'}>
				<li className="hover:bg-gray-100 py-2 px-4 rounded-md ">Home</li>
			</NavLink>
			<NavLink to={'/upload'}>
				<li className="hover:bg-gray-100 py-2 px-4 rounded-md">Upload</li>
			</NavLink>
		</ul>
	);
};

export default Header;
