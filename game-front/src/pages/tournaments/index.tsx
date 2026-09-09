import { Route, Routes } from 'react-router-dom';

import CreateTournament from './create';
import { MyTournament } from './myTournaments';
import { Tournament } from './tournament';
import { Participants } from './participants';
import { MyTournamentUsers } from './myTournaments/users';
import { Levels } from './levels';

export const TournameRoutes = () => {
	return (
		<div className="min-h-screen flex flex-col relative">
			<div className="fixed inset-0  from-amber-600 via-amber-700 to-amber-900">
				<div style={{ background: 'url(/assets/images/bg-menu.png) no-repeat', backgroundSize: '100% 100%' }} className="absolute inset-0">		
				</div>
			</div>
			<div className="relative flex-1 flex flex-col p-4 pb-24">
				<Routes>
					<Route path="/create" element={<CreateTournament />} />
					<Route path="/my/:id" element={<MyTournament />} />
					<Route path="/:id/participants" element={<Participants />} />
					<Route path="/:id/users" element={<MyTournamentUsers />} />
					<Route path="/:id/levels" element={<Levels />} />
					<Route path="/:id" element={<Tournament />} />
				</Routes>
			</div>
		</div>
	);
};