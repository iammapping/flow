import * as Promise from 'bluebird';
import {Flow} from '../flow';

class LazyMan extends Flow {
	constructor(name: string) {
		super([function() {
			console.log('Hi, I am %s', name);
		}]);
		
		process.nextTick(() => this.start());
	}

	sleep(second: number) {
		return this.append(function() {
			return new Promise((resolve, reject) => {
				setTimeout(() => {
					console.log('Wake up after %ds!', second);
					resolve();
				}, second * 1000);
			});
		});
	}

	sleepFirst(second: number) {
		return this.prepend(function() {
			return new Promise((resolve, reject) => {
				setTimeout(() => {
					console.log('Wake up after %ds!', second);
					resolve();
				}, second * 1000);
			});
		});
	}

	eat(food: string) {
		return this.append(function() {
			console.log('Eat %s~', food);
		});
	}
}

new LazyMan('mapping').sleep(2).eat('apple').sleepFirst(5);
