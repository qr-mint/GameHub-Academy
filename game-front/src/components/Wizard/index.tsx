import { useEffect, Children, createContext, useContext, useState } from 'react';

const WizardContext = createContext({});

// helper function to get context
export function useWizardContext () {
	return useContext(WizardContext);
}

export function WizardContainer ({ children }) {
	const [ numStages, setNumStages ] = useState();
	const [ currentStage, setCurrentStage ] = useState(1); // start at 1
	const [ state, setState ] = useState();
	const ctx = {
		state,
		setState,
		numStages,
		setNumStages,
		currentStage,
		handleGoToStage: (stage: any) => setCurrentStage(stage),
		handleNext: (callback: () => void) => {
			setCurrentStage((stage) => stage + 1);
			if (typeof callback === 'function') callback();
		},
		handlePrev: () => setCurrentStage((stage) => stage - 1),
	};
	return (
		<WizardContext.Provider value={ctx}>
			{children}
		</WizardContext.Provider>
	);
}



export function WizardStages ({ children }) {
	const { currentStage, setNumStages } = useWizardContext();
	const filteredStages = (Array.isArray(children)
		? children
		: [children]
	).filter((child: any) => !child.props?.hidden);
	const childrenCount = Children.count(filteredStages);

	// set num of stages, based on num of children passed in
	useEffect(
		() => setNumStages(childrenCount),
		[ childrenCount, setNumStages ]
	);

	const currentStageComponent = 
      Children.toArray(filteredStages)[currentStage - 1];

	return currentStageComponent;
}