import * as Promise from 'bluebird';

// define the Task type
// accept function, flow instance, array filled with function and flow instance
type Task = Function | Flow | Array<Function | Flow>;

/**
 * A simple flow framework by promise
 * 
 * Example:
 * new Flow([
 *   function() {
 *     return Promise.resolve('one');
 *   },
 *   function(last) {
 *     // last now equals 'one'
 *     console.log(last);
 *     return 'two';
 *   },
 *   function(last) {
 *     // last now equals 'two'
 *     console.log(last);
 *     return 'three';
 *   }
 * ]).start().then((last) => {
 *   // last now equals 'three'
 *   console.log(last);
 * });
 * 
 * @export
 * @class Flow
 */
export class Flow {
	/**
	 * keep the last task returned value
	 * 
	 * @private
	 * @type {*}
	 * @memberOf Flow
	 */
	private lastValue: any;
	
	/**
	 * point to the parent flow, while this is a child flow
	 * 
	 * @type {Flow}
	 * @memberOf Flow
	 */
	public parent: Flow = null;

	/**
	 * Creates an instance of Flow.
	 * 
	 * @param {Array<Task>} [tasks=[]] the init tasks
	 * 
	 * @memberOf Flow
	 */
	constructor(protected tasks: Array<Task> = []) {
		if (!(this instanceof Flow)) {
			return new Flow(tasks);
		}
	}

	/**
	 * add tasks from tail
	 * 
	 * @param {...Array<Task>} tasks
	 * @returns
	 * 
	 * @memberOf Flow
	 */
	append(...tasks: Array<Task>) {
		this.tasks = this.tasks.concat(tasks);

		return this;
	}

	
	/**
	 * add tasks from head
	 * 
	 * @param {...Array<Task>} tasks
	 * @returns
	 * 
	 * @memberOf Flow
	 */
	prepend(...tasks: Array<Task>) {
		this.tasks = tasks.concat(this.tasks);

		return this;
	}

	/**
	 * exec the task
	 * 
	 * @private
	 * @param {Task} task a task in tasks
	 * @param {*} last the returned value from last task
	 * @returns
	 * 
	 * @memberOf Flow
	 */
	protected exec(task: Task, last: any) {
		this.lastValue = last;

		// executor of a single task
		let single = (t) => {
			if (t instanceof Flow) {
				// the task is a flow instance as a child flow
				// specify the child flow's parent to this
				t.parent = this;

				// start the child flow
				return t.start(last);
			} else {
				// the task is a function
				// exec the function
				return t.call(this, last);
			}
		}

		if (Array.isArray(task)) {
			// task is an array 
			// exec each task concurrently
			return Promise.map(task, function(it) {
				return single(it);
			});
		} else {
			return single(task);
		}
	}

	/**
	 * start the flow
	 * 
	 * @param {*} [initValue=Promise.resolve()] the init value to the flow
	 * @returns {Promise<any>}
	 * 
	 * @memberOf Flow
	 */
	start(initValue: any = Promise.resolve()) : Promise<any> {
		// exec each task one by one
		return Promise.reduce(this.tasks, (last, curr) => {
			return this.exec(curr, last);
		}, initValue);
	}
}
