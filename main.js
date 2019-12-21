(function () {
    /**
     * 
     * @param {string} id
     * @returns { {canvas: HTMLCanvasElement, context: CanvasRenderingContext2D }}
     */
    function getCanvasAndContext(id) {
        const canvas = document.getElementById('canvas'); /* {HTMLCanvasElement} */
        // @ts-ignore
        const context = canvas.getContext('2d');
        // @ts-ignore
        return { canvas, context };
    }

    class Grammar {
        constructor(alphabet, start, productionRules) {
            this.alphabet = alphabet;
            this.start = start;
            this.productionRules = productionRules;
            Object.freeze(this);
        }
    }
    
    /**
     * 
     * @param {Number} maxDepth 
     * @param {Grammar} grammar
     * @param {Array<string>} currentState
     * @param {Number} currentDepth
     * @returns {string}
     */
    function runGrammar(maxDepth, grammar, currentState = grammar.start, currentDepth = 0) {
        if (currentDepth >= maxDepth)
            return currentState.join('');

        const transforms = Object.assign({}, grammar.productionRules);
        grammar.alphabet.constants.forEach(c => transforms[c] = c);

        const newState = currentState.flatMap( symbol => transforms[symbol] );
        return runGrammar(maxDepth, grammar, newState, currentDepth + 1);
    };

    class Location {
        /**
         * @param {number} x
         * @param {number} y
         * @param {number} angle
         */
        constructor(x,y,angle) {
            this.x = x;
            this.y = y;
            this.angle = angle;
        }
    }

    class State {
        /**
         * 
         * @param {Location} currentLocation
         * @param {Location[]} history
         * @param {string} instructions
         */
        constructor(currentLocation, history = [], instructions) {
            this.currentLocation = currentLocation;
            this.history = history;
        }
    }


    /**
     * @param {CanvasRenderingContext2D} context
     * @param {string} instructions
     */
    function draw(context, instructions) {

        const initialLocation = new Location(context.canvas.width/2, context.canvas.height, Math.PI);
        context.beginPath();
        context.moveTo(initialLocation.x, initialLocation.y);

        let state = new State(initialLocation, [], instructions);
        for (let i=0 ; i<instructions.length ; i++) {
            let d = 0.04;
            let newX = state.currentLocation.x + d*Math.sin(state.currentLocation.angle);
            let newY = state.currentLocation.y + d*Math.cos(state.currentLocation.angle);
            let newAngle = state.currentLocation.angle;

            switch(instructions.substr(i,1)) {
                case '0':
                    context.lineTo(newX, newY);
                    state = new State(new Location(newX, newY, newAngle), state.history, instructions);
                    //TODO: Draw leaf
                    break;
                case '1':
                    context.lineTo(newX, newY);
                    state = new State(new Location(newX, newY, newAngle), state.history, instructions);
                    break;
                case '[':
                    state.history.push(Object.assign({}, state.currentLocation));
                    state.currentLocation.angle = state.currentLocation.angle - Math.PI/4;
                    break;
                case ']':
                    state.currentLocation = state.history.pop();
                    state.currentLocation.angle = state.currentLocation.angle + Math.PI/4;
                    context.moveTo(state.currentLocation.x, state.currentLocation.y);
                    break;
                default:
                    throw Error("Invalid instruction:" + instructions.substr(i,1) + " at " + i);
            }
        }
        context.stroke();
        
        // const positions = [ { x: context.canvas.width/2, y: 0, angle: Math.PI/2 } ];
        // context.beginPath();
        // context.moveTo(positions[0].x, positions[0].y);
        // for (let i=0 ; i<state.length ; i++) {
        //     switch(state[i]) {
        //         case '0':
        //             let oldPos = positions[positions.length-1];
        //             let newPos = {
        //                 x: oldPos.x + 5*Math.sin(oldPos.angle),
        //                 y: oldPos.y + 5*Math.cos(oldPos.angle),
        //                 angle: oldPos.angle
        //             }
        //             context.lineTo(newPos.x, newPos.y);
        //             positions.push(newPos);
        //         case '1':
        //             let oldPos = positions[positions.length-1];
        //             let newPos = {
        //                 x: oldPos.x + 5*Math.sin(oldPos.angle),
        //                 y: oldPos.y + 5*Math.cos(oldPos.angle),
        //                 angle: oldPos.angle
        //             }
        //             context.lineTo(newPos.x, newPos.y);
        //             positions.push(newPos);
            
        //     }
        // }
    }


    document.addEventListener('DOMContentLoaded', function() {
        const { canvas, context } = getCanvasAndContext('canvas');
        context.beginPath();
        // context.moveTo(canvas.width/2, canvas.height/2);
        // context.lineTo(200, 200);
        // context.stroke();

        const alphabet = { variables: [ '0', '1' ], constants: [ '[', ']' ] };
        const start = [ '0' ];
        const rules = {
            '1': ['1', '1'],
            '0': ['1', '[', '0', ']', '0' ]
        };
        const grammar = new Grammar(alphabet, start, rules);


        const instructions = runGrammar(14, grammar);
        console.log({instructions});
        draw(context, instructions);
    });
})();