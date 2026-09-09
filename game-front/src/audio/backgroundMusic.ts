type MusicManifest = {
  generatedAt?: string;
  files: string[];
};

let audio: HTMLAudioElement | null = null;
let currentSrc: string | null = null;
let manifestPromise: Promise<MusicManifest> | null = null;

function loadManifest (manifestPath: string): Promise<MusicManifest> {

	manifestPromise = fetch(manifestPath, { cache: 'no-cache' })
		.then(async (r) => {

			if (!r.ok) throw new Error(`Failed to load music manifest: ${r.status}`);
			return (await r.json()) as MusicManifest;
		})
		.catch((err) => {
			manifestPromise = null;
			throw err;
		});
	
	return manifestPromise;
}

function pickRandom<T> (arr: T[]): T | undefined {
	if (arr.length === 0) return undefined;
	const idx = Math.floor(Math.random() * arr.length);
	return arr[idx];
}

let currentManifestPath: string | null = null;

export async function startBackgroundMusic (
	manifestPath: string
): Promise<void> {
	if (
		audio &&
		!audio.paused &&
		currentManifestPath === manifestPath
	) {
		return;
	}

	if (audio && !audio.paused) {
		audio.pause();
		audio.currentTime = 0;
	}

	const manifest = await loadManifest(manifestPath);
	const src = pickRandom(manifest.files);
	console.log(src, manifestPath, manifest.files);
	if (!src) return;

	currentManifestPath = manifestPath;
	currentSrc = src;

	if (!audio) {
		audio = new Audio();
		audio.preload = 'auto';

		audio.addEventListener('ended', () => {
			if (!audio || !currentSrc) return;

			audio.currentTime = 0;
			void audio.play().catch(() => {});
		});
	}

	audio.src = src;
	audio.currentTime = 0;

	await audio.play().catch((err) => {
		console.log(err);
	});
}

export function stopBackgroundMusic (): void {
	if (!audio) return;
	audio.pause();
	audio.currentTime = 0;
}


export function muteBackgroundMusic (): void {
	if (!audio) return;
	audio.muted = true;
}

export function unmuteBackgroundMusic (): void {
	if (!audio) return;
	audio.muted = false;
}

export function toggleMuteBackgroundMusic (): void {
	if (!audio) return;
	audio.muted = !audio.muted;
}

// Если хочешь знать текущее состояние
export function isMuted (): boolean {
	return audio ? audio.muted : false;
}