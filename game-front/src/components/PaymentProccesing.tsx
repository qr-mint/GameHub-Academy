export function PaymentProccesing ({ t }: { t: (key: string) => string }) {
	return (
		<div className="fixed inset-0 w-full h-full flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm z-50">
			<div className="text-amber text-xl mb-4">{t('Payment Proccessing')}</div>
			<div className="flex justify-center">
				{/* <Preloader size="large" /> */}
			</div>
		</div>
	);
}
