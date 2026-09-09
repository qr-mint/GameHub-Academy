import { useEffect, useRef, useState } from 'react';

const TIMES = 1000 * 3600 * 24;

export const useTimer = ({ date, updateRequest }) => {
	const [ _, setRerender ] = useState(0); // Dummy state to force re-renders
	const timeRef = useRef(new Date(date).getTime() - Date.now());
	const intervalRef = useRef();

	useEffect(() => {
		const updateTimer = () => {
			timeRef.current -= 1000;

			if (timeRef.current <= 0) {
				clearInterval(intervalRef.current);
				if (updateRequest) {
					updateRequest();
				}
			} else {
				setRerender(prev => prev + 1); // Force re-render
			}
		};

		intervalRef.current = setInterval(updateTimer, 1000);

		return () => clearInterval(intervalRef.current);
	}, [updateRequest]);

	const day = Math.floor(timeRef.current / TIMES);
	const hours = Math.floor((timeRef.current % TIMES) / 3600000);
	const minutes = Math.floor(((timeRef.current % TIMES) % 3600000) / 60000);
	const seconds = Math.floor(((timeRef.current % TIMES) % 60000) / 1000);

	return {
		day, hours, minutes, seconds
	};
};
