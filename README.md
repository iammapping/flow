# Flow
A simple flow framework by Promise.

It's time to say goodbye to `async.waterfall` and `async.parallel`.

If we want to implement the following flow:

![](http://self-storage.b0.upaiyun.com/2017/02/10/148673957560530273.png)

1. `Task1` return 'a';
2. `Task2_1`、`Task2_2`、`Task2_3` execute in parallel;
   1. `Task2_1` receive 'a' return 'b1';
   2. `Task2_2` receive 'a' return b2;
      1. `Task3` receive 'b2' return 'c' after `Task2_2` excuted;
   3. `Task2_3` receive 'a' return 'b3';
3. `Task4` receive ['b1', 'c', 'b3'].

Use `async.waterfall` and `async.parallel`:

```javascript
async.waterfall([
    function Task1(callback) {
        callback(null, 'a');
    },
    function(last, callback) {
        // last equals 'a'
        async.parallel([
            function Task2_1(callback) {
                // last equals 'a'
                callback(null, 'b1');
            },
            function(callback) {
                async.waterfall([
                    function Task2_2(callback) {
                        // last equals 'a'
                        callback(null, 'b2');
                    },
                    function Task3(last, callback) {
                        // last equals 'b2'
                        callback(null, 'c');
                    }
                ], callback);
            },
            function Task2_3(callback) {
                // last equals 'a'
                callback(null, 'b3');
            }
        ], callback);
    },
    function Task4(last, callback) {
        // last equals ['b1', 'c', 'b3']
        callback(null, 'd');
    }
], function(err, result) {
    // result equals 'd'
});
```

But with `Flow`, it's simple and clean:

```javascript
new Flow([
    function Task1() {
        return 'a';
    },
    [
        function Task2_1(last) {
        	// last equals 'a'
            return 'b1';
        },
        new Flow([
            function Taks2_2(last) {
            	// last equals 'a'
                return 'b2';
            },
            function Task3(last) {
            	// last equals 'b2'
                return 'c';
            }
        ]),
        function Task2_3(last) {
        	// last equals 'a'
            return 'b3';
        }
    ],
    function Task4(last) {
    	// last equals ['b1', 'c', 'b3']
        console.log(last);
    }
]).start();
```

## API references

### new Flow(tasks)

Create a new `Flow` instance.

Paramter `tasks` is **optional**, it should be a task array if specified, 
the task accept `Function` and `Flow`, or an `Array` contains them.

### Flow.prototype.start(initValue)

Start the flow.

Paramter `initValue` is **optional**, it's the init value to the fist task.

### Flow.prototype.append(...tasks)

Append tasks to the flow instance.

### Flow.prototype.prepend(...tasks)

Prepend tasks to the flaw instance.

## Example

You can extend the `Flow` to do some interesting. 

* [LazyMan](https://github.com/iammapping/flow/blob/master/example/lazyman.ts)

## Contribute

1. clone this repo, `git clone https://github.com/iammapping/flow`
2. cd /the_flow_dir
3. `npm install`
4. `typings install`
5. write with `TypeScript`

## License

MIT