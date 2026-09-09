import { WizardContainer } from '@/components/Wizard';
import { TournamentForm } from '@/components/Tournaments/TournamentForm';

export default function CreateTournament () {
	return (
		<WizardContainer>
			<TournamentForm />
		</WizardContainer>
	);
}
