class Store {
	public score: number = 0;
	
	public timer: number;
	public currentZoom: number = 1;


	public controls: any;
	public joystick: any;

	public tournament: any;
	
	public pause: boolean = false;

	reset () {
		this.score = 0;
		this.timer = Date.now();
		this.controls = { up: false, down: false, left: false, right: false };
		this.pause = false;
	}
}

export const store = new Store();