"use strict";
var Promise = require('bluebird');
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
var Flow = (function () {
    /**
     * Creates an instance of Flow.
     *
     * @param {Array<Task>} [tasks=[]] the init tasks
     *
     * @memberOf Flow
     */
    function Flow(tasks) {
        if (tasks === void 0) { tasks = []; }
        this.tasks = tasks;
        /**
         * point to the parent flow, while this is a child flow
         *
         * @type {Flow}
         * @memberOf Flow
         */
        this.parent = null;
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
    Flow.prototype.append = function () {
        var tasks = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            tasks[_i - 0] = arguments[_i];
        }
        this.tasks = this.tasks.concat(tasks);
        return this;
    };
    /**
     * add tasks from head
     *
     * @param {...Array<Task>} tasks
     * @returns
     *
     * @memberOf Flow
     */
    Flow.prototype.prepend = function () {
        var tasks = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            tasks[_i - 0] = arguments[_i];
        }
        this.tasks = tasks.concat(this.tasks);
        return this;
    };
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
    Flow.prototype.exec = function (task, last) {
        var _this = this;
        this.lastValue = last;
        // executor of a single task
        var single = function (t) {
            if (t instanceof Flow) {
                // the task is a flow instance as a child flow
                // specify the child flow's parent to this
                t.parent = _this;
                // start the child flow
                return t.start(last);
            }
            else {
                // the task is a function
                // exec the function
                return t.call(_this, last);
            }
        };
        if (Array.isArray(task)) {
            // task is an array 
            // exec each task concurrently
            return Promise.map(task, function (it) {
                return single(it);
            });
        }
        else {
            return single(task);
        }
    };
    /**
     * start the flow
     *
     * @param {*} [initValue=Promise.resolve()] the init value to the flow
     * @returns {Promise<any>}
     *
     * @memberOf Flow
     */
    Flow.prototype.start = function (initValue) {
        var _this = this;
        if (initValue === void 0) { initValue = Promise.resolve(); }
        // exec each task one by one
        return Promise.reduce(this.tasks, function (last, curr) {
            return _this.exec(curr, last);
        }, initValue);
    };
    return Flow;
}());
exports.Flow = Flow;
