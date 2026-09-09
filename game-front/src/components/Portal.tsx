import React, { useState, useEffect } from 'react';
import ReactDom from 'react-dom';
import PropTypes from 'prop-types';

export const Portal = ({ children }) => {
	const [ mounted, setMounted ] = useState(false);
	useEffect(() => {
		setMounted(true);
		return () => setMounted(false);
	}, []);

	return mounted ? (
		ReactDom.createPortal(children, document.getElementById('root'))
	) : (
		<></>
	);
};

Portal.propTypes = {
	children: PropTypes.oneOfType([ PropTypes.array, PropTypes.object ]),
};

