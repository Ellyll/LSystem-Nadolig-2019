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
     * 
     * @param {number} degrees
     * @returns {number}
     */
    function degToRad(degrees) {
        return degrees * ((Math.PI*2) / 360.0);
    }


    /**
     * @param {CanvasRenderingContext2D} context
     * @param {string} instructions
     * @param {number} angleStep
     * @param {number} distance
     * @param {string | CanvasGradient | CanvasPattern} colour
     * @param {boolean} shouldDrawLights
     */
    function draw(context, instructions, angleStep, distance, colour, shouldDrawLights) {

        const initialLocation = new Location(context.canvas.width/2, context.canvas.height/1.1, Math.PI);
        context.beginPath();
        context.strokeStyle = colour;
        context.moveTo(initialLocation.x, initialLocation.y);

        const colours = [ 'red', 'yellow', 'blue', 'purple', 'magenta', 'cyan' ];
        let colourIndex = 0;

        let state = new State(initialLocation, [], instructions);
        for (let i=0 ; i<instructions.length ; i++) {
            let newX = state.currentLocation.x + distance*Math.sin(state.currentLocation.angle);
            let newY = state.currentLocation.y + distance*Math.cos(state.currentLocation.angle);
            let newAngle = state.currentLocation.angle;
            let oldFillStyle;

            switch(instructions.substr(i,1)) {
                case 'F':
                    context.lineTo(newX, newY);
                    context.stroke();
                    if (shouldDrawLights && Math.random() >= 0.95) {
                        oldFillStyle = context.fillStyle;
                        context.beginPath();
                        context.fillStyle = colours[colourIndex % colours.length];
                        colourIndex++;
                        context.arc(newX, newY, 3, 0, Math.PI*2);
                        context.fill();
                        context.fillStyle = oldFillStyle;
                    }
                    state = new State(new Location(newX, newY, newAngle), state.history, instructions);                    
                    break;
                case '[':
                    state.history.push(Object.assign({}, state.currentLocation));
                    break;
                case ']':
                    state.currentLocation = state.history.pop();
                    context.beginPath();
                    context.moveTo(state.currentLocation.x, state.currentLocation.y);
                    break;
                case '+':
                    state.currentLocation.angle = state.currentLocation.angle + angleStep;
                    break;
                case '-':
                    state.currentLocation.angle = state.currentLocation.angle - angleStep;
                    break;
                default:
                    throw Error("Invalid instruction:" + instructions.substr(i,1) + " at " + i);
            }
        }
    }

    /**
     * 
     * @param {HTMLCanvasElement} canvas 
     */
    function maximise(canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }


    document.addEventListener('DOMContentLoaded', function() {
        const { canvas, context } = getCanvasAndContext('canvas');
        maximise(canvas);


        // Tree
        const alphabet = { variables: [ 'F' ], constants: '[]-+'.split('') };
        const start = 'F'.split('');
        const rules = {
           'F': 'F[+FF][-FF]F[-F][+F]F'.split('')
        };
        const grammar = new Grammar(alphabet, start, rules);
        const angleStep = degToRad(69/4); // degToRad(36);
        const distance = 10;
        const instructions = runGrammar(4, grammar);
        context.rotate(Math.PI);
        context.translate(-canvas.width, -canvas.height);
        draw(context, instructions, angleStep, distance, 'rgb(5, 68, 13)', true);
        context.resetTransform();

        // Star
        const starStart = 'F'.split('');
        const starRules = {
           'F': 'F++F'.split('')
        };
        const starGrammar = new Grammar(alphabet, starStart, starRules);
        const starAngleStep = degToRad(99); // degToRad(36);
        const starDistance = 90;
        const starInstructions = runGrammar(7, starGrammar);
        const starColour = 'yellow';
        context.rotate(Math.PI);
        context.translate(-(canvas.width+6), -(canvas.height-74));
        draw(context, starInstructions, starAngleStep, starDistance, starColour, false);
    });
})();