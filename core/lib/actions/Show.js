import { Action } from '../Action';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

export class Show extends Action {

	static setup () {
		Monogatari.history ('particle');
		Monogatari.history ('image');
		Monogatari.history ('character');
		Monogatari.state ({
			particles: '',
			images: [],
			characters: []
		});
		return Promise.resolve ();
	}

	static reset () {
		$_(`${Monogatari.selector} #game [data-character]`).remove ();
		$_(`${Monogatari.selector} #game [data-image]`).remove ();
		return Promise.resolve ();
	}

	static onLoad () {
		const { particles, show } = Monogatari.state ();
		if (particles !== '') {
			Monogatari.run (particles, false);
		}

		for (const item of show) {
			Monogatari.run (item, false);
		}

		return Promise.resolve ();
	}

	static matchString ([ action ]) {
		return action === 'show';
	}

	constructor ([ action, asset, ...props ]) {
		super ();
		this.asset = asset;

		if (typeof Monogatari.character (asset) !== 'undefined') {
			Monogatari.state ({
				characters: [this._statement, ...Monogatari.state ('characters')]
			});
			this.type = 'character';
			// show [character] [expression] at [position] with [animation] [infinite]
			const [sprite, ...classes] = props.join (' ').replace(' at ', ' ').replace (' with ', ' ').trim ().split (' ');

			this.sprite = sprite;
			this.classes = ['animated', ...classes];
			this.character = Monogatari.character (asset);
			this.image = this.character.Images[this.sprite];
		} else {
			Monogatari.state ({
				images: [this._statement, ...Monogatari.state ('images')]
			});
			this.type = 'image';
			if (typeof Monogatari.asset ('images', asset) !== 'undefined') {
				this.image = Monogatari.asset ('images', asset);
			} else {
				this.image = asset;
			}
		}
	}

	apply () {

		// show [character] [expression] at [position] with [animation] [infinite]
		//   0      1             2       3     4        5       6         7

		// show [character] [expression] with [animation] [infinite]
		//   0      1             2       3       4         5

		// show [character] [expression]
		//   0      1             2

		if (this.type === 'character') {
			let directory = this.character.Directory;

			if (typeof directory == 'undefined') {
				directory = '';
			} else {
				directory += '/';
			}

			const object = `<img src="assets/characters/${directory}${this.image}" class="animated ${this.classes.join (' ')}" data-character="${this.asset}" data-sprite="${this.sprite}">`;

			if ($_(`${Monogatari.selector} [data-character="${this.asset}"]`).isVisible ()) {
				$_(`${Monogatari.selector} [data-character="${this.asset}"]`).removeClass ();
				$_(`${Monogatari.selector} [data-character="${this.asset}"]`).attribute ('src', `assets/characters/${directory}${this.image}`);
				for (const newClass of this.classes) {
					$_(`${Monogatari.selector} [data-character="${this.asset}"]`).addClass (newClass);
				}
				$_(`${Monogatari.selector} [data-character="${this.asset}"]`).data ('sprite', this.sprite);
			} else {
				$_(`${Monogatari.selector} [data-character="${this.asset}"]`).remove ();
				$_(`${Monogatari.selector} #game`).append (object);
			}

			Monogatari.history ('character').push (object);

		} else {
			// show [image] at [position] with [animation]
			//   0     1     2      3      4        5

			// show [image] with [animation]
			//   0      1     2       3

			// show [image]
			//   0      1

			const object = `<img src="assets/images/${this.image}" class="animated ${this.classes.join (' ')}" data-image="${this.asset}" data-sprite="${this.sprite}">`;
			$_(`${Monogatari.selector} #game`).append (object);
			Monogatari.history ('image').push (object);
		}
		return Promise.resolve ();
	}

	didApply () {
		return Promise.resolve (true);
	}

	revert () {
		if (this.type === 'character') {
			$_(`${Monogatari.selector} [data-character="${this.asset}"]`).remove();
			if (Monogatari.history ('character').length > 1) {
				Monogatari.history ('character').pop ();
			}

			const last_character = Monogatari.history ('character').slice(-1)[0];
			if (typeof last_character != 'undefined') {
				if (last_character.indexOf (`data-character="${this.asset}"`) > -1) {
					$_(`${Monogatari.selector} #game`).append (last_character);
				}
			}
		} else {
			if (this.classes.length > 0) {
				for (const newClass of this.classes) {
					$_(`${Monogatari.selector} [data-image="${this.asset}"]`).addClass(newClass);
				}

			} else {
				$_(`${Monogatari.selector} [data-image="${this.asset}"]`).remove ();
			}
			Monogatari.history ('image').pop ();
		}
		return Promise.resolve ();
	}

	didRevert () {
		return Promise.resolve (true);
	}
}

Show.id = 'Show';

Monogatari.registerAction (Show);