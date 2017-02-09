"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Promise = require('bluebird');
var flow_1 = require('../flow');
var LazyMan = (function (_super) {
    __extends(LazyMan, _super);
    function LazyMan(name) {
        var _this = this;
        _super.call(this, [function () {
                console.log('Hi, I am %s', name);
            }]);
        process.nextTick(function () { return _this.start(); });
    }
    LazyMan.prototype.sleep = function (second) {
        return this.append(function () {
            return new Promise(function (resolve, reject) {
                setTimeout(function () {
                    console.log('Wake up after %ds!', second);
                    resolve();
                }, second * 1000);
            });
        });
    };
    LazyMan.prototype.sleepFirst = function (second) {
        return this.prepend(function () {
            return new Promise(function (resolve, reject) {
                setTimeout(function () {
                    console.log('Wake up after %ds!', second);
                    resolve();
                }, second * 1000);
            });
        });
    };
    LazyMan.prototype.eat = function (food) {
        return this.append(function () {
            console.log('Eat %s~', food);
        });
    };
    return LazyMan;
}(flow_1.Flow));
new LazyMan('mapping').sleep(2).eat('apple').sleepFirst(5);
