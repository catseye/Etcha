/*
 * An EtchaController implements the semantics of Etcha.
 * The source code in this file has been placed into the public domain.
 */

/*
 * requires yoob.Controller
 * requires yoob.Playfield
 * requires yoob.Cursor
 * requires yoob.PlayfieldCanvasView
 */

function EtchaPlayfield() {
    this.setDefault(0);

    this.toggle = function(x, y) {
        var data = this.get(x, y);
        this.put(x, y, data === 0 ? 1 : 0);
    };
};
EtchaPlayfield.prototype = new yoob.Playfield();


// An Awkward But Seemingly Successful Attempt at Calling a Super Method
var proto = new yoob.PlayfieldCanvasView();
function EtchaPlayfieldView() {
    yoob.PlayfieldCanvasView.call(this);

    this.init = function(pf, canvas) {
        proto.init.apply(this, [pf, canvas]);
        this.drawCursorsFirst = false;
        return this;
    };

    this.drawCell = function(ctx, value, playfieldX, playfieldY,
                             canvasX, canvasY, cellWidth, cellHeight) {
        ctx.fillStyle = value === 0 ? "white" : "black";
        ctx.fillRect(canvasX, canvasY, cellWidth, cellHeight);
    };
};
EtchaPlayfieldView.prototype = proto;


function EtchaTurtle() {
    this.reset = function() {
        this.x = 0;
        this.y = 0;
        this.dx = 0;
        this.dy = -1;
        this.penCounter = 0;
        this.penDown = true;
    };

    this.drawContext = function(ctx, x, y, cellWidth, cellHeight) {
        ctx.save();
        ctx.globalAlpha = 0.75;
        ctx.fillStyle = "#50ff50";
        ctx.beginPath();
        if (this.dx === 0 && this.dy === 1) {
            ctx.moveTo(x, y);
            ctx.lineTo(x + cellWidth, y);
            ctx.lineTo(x + cellWidth * 0.5, y + cellHeight); 
        } else if (this.dx === 0 && this.dy === -1) {
            ctx.moveTo(x, y + cellWidth);
            ctx.lineTo(x + cellWidth, y + cellHeight);
            ctx.lineTo(x + cellWidth * 0.5, y); 
        } else if (this.dx === 1 && this.dy === 0) {
            ctx.moveTo(x, y);
            ctx.lineTo(x + cellWidth, y + cellHeight * 0.5);
            ctx.lineTo(x, y + cellHeight);
        } else if (this.dx === -1 && this.dy === 0) {
            ctx.moveTo(x + cellWidth, y);
            ctx.lineTo(x, y + cellHeight * 0.5);
            ctx.lineTo(x + cellWidth, y + cellHeight);
        } else {
            ctx.fillRect(x, y, cellWidth, cellHeight);
        }
        ctx.closePath();
        ctx.fill();
        if (this.penDown) {
            ctx.fillStyle = 'black';
            ctx.fillRect(x + cellWidth * 0.4, y + cellHeight * 0.4,
                         cellWidth * 0.2, cellHeight * 0.2);
        }
        ctx.restore();
    };
};
EtchaTurtle.prototype = new yoob.Cursor();


function EtchaProgram() {
    this.setDefault(' ');

    this.getRowExtents = function(targetY) {
        var minX = undefined;
        var maxX = undefined;
        this.foreach(function(x, y, value) {
            if (y !== targetY) return;
            if (minX === undefined || x < minX) minX = x;
            if (maxX === undefined || x > maxX) maxX = x;
        });
        return [minX, maxX];
    };
};
EtchaProgram.prototype = new yoob.Playfield();


function EtchaProgramCounter() {
    this.reset = function() {
        this.x = 0;
        this.y = 0;
        this.dx = 1;
        this.dy = 0;
    };

    this.advance = function(pf) {
        this.x++;
        var y = this.y;
        var extents = pf.getRowExtents(y);
        var maxX = extents[1];
        if (this.x > maxX) {
            y++;
            extents = pf.getRowExtents(y);
            while (extents[0] === undefined && y <= pf.getMaxY()) {
                y++;
                extents = pf.getRowExtents(y);
            }
            if (extents[0] === undefined) {
                return false;
            }   
            this.x = extents[0];
            this.y = y;
        }
        return true;
    };

    this.drawContext = function(ctx, x, y, cellWidth, cellHeight) {
        ctx.fillStyle = "#a0a0ff";
        ctx.fillRect(x, y, cellWidth, cellHeight);
    };
};
EtchaTurtle.prototype = new yoob.Cursor();


function EtchaController() {
    var intervalId;

    var p;
    var turtle;
    var program;
    var progPf;
    var pc;
    var halted;

    this.init = function(pfView, progView) {
        p = new EtchaPlayfield();
        this.pfView = pfView;
        this.pfView.pf = p;
        turtle = new EtchaTurtle();
        turtle.reset();
        this.pfView.setCursors([turtle]);

        progPf = new EtchaProgram();
        this.progView = progView;
        this.progView.pf = progPf;
        pc = new EtchaProgramCounter();
        pc.reset();
        this.progView.setCursors([pc]);

        this.load("");
    };

    this.draw = function() {
        progView.draw();
        pfView.draw();
    };

    this.step = function() {
        if (halted) return;
        var instruction = progPf.get(pc.x, pc.y);
        switch (instruction) {
            case '+':
                // + -- equivalent to FD 1
                if (turtle.penDown) {
                    p.toggle(turtle.x, turtle.y);
                }
                turtle.advance();
                break;
            case '>':
                // > -- equivalent to RT 90; toggles PU/PD every 4 executions
                turtle.rotateClockwise();
                turtle.rotateClockwise();
                turtle.penCounter++;
                turtle.penCounter %= 4;
                if (turtle.penCounter === 0) {
                    turtle.penDown = !turtle.penDown;
                }
                break;
            case '[':
                // [ WHILE Begin a while loop
                if (p.get(turtle.x, turtle.y) === 0) {
                    // skip forwards to matching ]
                    var depth = 0;
                    for (;;) {
                        if (progPf.get(pc.x, pc.y) == '[') {
                            depth++;
                        } else if (progPf.get(pc.x, pc.y) == ']') {
                            depth--;
                            if (depth === 0)
                                break;
                        }
                        if (!pc.advance(progPf)) {
                            halted = true;
                            return;
                        }
                    }
                }
                break;
            case ']':
                // ] END End a while loop
                // skip backwards to matching ]
                var depth = 0;
                for (;;) {
                    if (progPf.get(pc.x, pc.y) == '[') {
                        depth--;
                    } else if (progPf.get(pc.x, pc.y) == ']') {
                        depth++;
                    }
                    pc.x--;
                    if (depth === 0 || pc.x < 0)
                        break;
                }
                break;
            default:
                // NOP
                break;
        }

        if (!pc.advance(progPf)) {
            halted = true;
        }

        this.draw();
    };

    this.load = function(text) {
        p.clear();
        program = text;
        progPf.clear();
        progPf.load(0, 0, text);
        turtle.reset();
        pc.reset();
        halted = false;
        this.draw();
    };
};
EtchaController.prototype = new yoob.Controller();
