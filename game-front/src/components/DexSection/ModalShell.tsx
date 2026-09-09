import type React from 'react';
import { X } from 'lucide-react';

import { Modal } from '../modal';


export function ModalShell ({
	isOpen,
	onClose,
	title,
	icon,
	children,
}: {
  isOpen: boolean
  onClose: () => void
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<div className="relative w-full max-w-md bg-gradient-to-br from-amber-700 to-amber-900 border-2 border-white/20 rounded-2xl p-5 max-h-[85vh] overflow-y-auto">
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center gap-2">
						<div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white">{icon}</div>
						<h3 className="text-lg font-bold text-white">{title}</h3>
					</div>
					<button
						onClick={onClose}
						className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center"
					>
						<X className="w-4 h-4 text-white" />
					</button>
				</div>
				{children}
			</div>
		</Modal>
	);
}
