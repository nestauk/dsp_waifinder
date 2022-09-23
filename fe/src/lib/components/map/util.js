export class CustomControl {

	constructor (component) {
		this.Component = component;
	}

	onAdd (map) {
		this._map = map;
		this._container = document.createElement('div');
		this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
		this.instance = new this.Component({
			target: this._container,
			props: {map}
		})
		return this._container;
	}

	onRemove () {
		this._container.parentNode.removeChild(this._container);
		this.map = undefined;
	}
}
