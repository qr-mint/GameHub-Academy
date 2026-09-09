import { Route, Routes } from 'react-router-dom';
import { type FunctionComponent } from 'react';

import { Game } from './pages/game';
import { GameMenu } from './pages';
import { TournameRoutes } from './pages/tournaments';

export const AppRouter: FunctionComponent = () => {
	return (
		<Routes>
			<Route path="/" element={<GameMenu />} />
			<Route path="/tournaments/*" element={<TournameRoutes />} />
			<Route path="/game" element={<Game />} />
		</Routes>
	);
};