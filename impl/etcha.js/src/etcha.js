/*
 * An EtchaController implements the semantics of Etcha.
 * The source code in this file has been placed into the public domain.
 */

/*
 * requires yoob.Controller
 * requires yoob.Playfield
 * requires yoob.Cursor
 * requires yoob.PlayfieldCanvasView
 * requires yoob.SourceHTMLView
 */

function EtchaPlayfield() {
    this.setDefault(0);

    this.toggle = function(x, y) {
        var data = this.get(x, y);
        this.put(x, y, data === 0 ? 1 : 0);
    };
};
EtchaPlayfield.prototype = new yoob.Playfield();


function makeEtchaPlayfieldView(cfg) {
    cfg.drawCursorsFirst = false;
    var pfView = new yoob.PlayfieldCanvasView().init(cfg);

    pfView.drawCell = function(ctx, value, playfieldX, playfieldY,
                               canvasX, canvasY, cellWidth, cellHeight) {
        ctx.fillStyle = value === 0 ? "white" : "black";
        ctx.fillRect(canvasX, canvasY, cellWidth, cellHeight);
    };

    pfView.drawCursor = function(ctx, cursor, x, y, cellWidth, cellHeight) {
        ctx.save();
        ctx.globalAlpha = 0.75;
        ctx.fillStyle = "#50ff50";
        ctx.beginPath();
        if (cursor.dx === 0 && cursor.dy === 1) {
            ctx.moveTo(x, y);
            ctx.lineTo(x + cellWidth, y);
            ctx.lineTo(x + cellWidth * 0.5, y + cellHeight); 
        } else if (cursor.dx === 0 && cursor.dy === -1) {
            ctx.moveTo(x, y + cellWidth);
            ctx.lineTo(x + cellWidth, y + cellHeight);
            ctx.lineTo(x + cellWidth * 0.5, y); 
        } else if (cursor.dx === 1 && cursor.dy === 0) {
            ctx.moveTo(x, y);
            ctx.lineTo(x + cellWidth, y + cellHeight * 0.5);
            ctx.lineTo(x, y + cellHeight);
        } else if (cursor.dx === -1 && cursor.dy === 0) {
            ctx.moveTo(x + cellWidth, y);
            ctx.lineTo(x, y + cellHeight * 0.5);
            ctx.lineTo(x + cellWidth, y + cellHeight);
        } else {
            ctx.fillRect(x, y, cellWidth, cellHeight);
        }
        ctx.closePath();
        ctx.fill();
        if (cursor.penDown) {
            ctx.fillStyle = 'black';
            ctx.fillRect(x + cellWidth * 0.4, y + cellHeight * 0.4,
                         cellWidth * 0.2, cellHeight * 0.2);
        }
        ctx.restore();
    };

    return pfView;
};


function EtchaTurtle() {
    this.reset = function() {
        this.x = 0;
        this.y = 0;
        this.dx = 0;
        this.dy = -1;
        this.penCounter = 0;
        this.penDown = true;
    };
};
EtchaTurtle.prototype = new yoob.Cursor();


function EtchaProgramCounter() {
    this.reset = function() {
        this.x = 0;
        this.y = 0;
        this.dx = 1;
        this.dy = 0;
    };

    this.advance = function(program) {
        this.x++;
        if (this.x <= program.length - 1) {
            return true;
        }
        return false;
    };

    this.wrapText = function(text) {
        var fillStyle = this.fillStyle || "#50ff50";
        return '<span style="background: ' + fillStyle + '">' +
               text + '</span>';
    };
};
EtchaProgramCounter.prototype = new yoob.Cursor();


var proto = new yoob.Controller();
function EtchaController() {
    var progPf;
    var pc;

    this.init = function(cfg) {
        this.playfield = new EtchaPlayfield();
        proto.init.apply(this, [cfg]);

        this.pfView = cfg.pfView;

        this.pfView.pf = this.playfield;
        this.turtle = new EtchaTurtle();
        this.turtle.reset();
        this.playfield.setCursors([this.turtle]);

        this.progView = cfg.view;
        pc = new EtchaProgramCounter();
        pc.reset();
        this.progView.setCursors([pc]);

        this.repeatIndefinitely = false;

        this.reset("");

        return this;
    };

    this.draw = function() {
        this.progView.setSourceText(this.program);
        this.progView.draw();
        this.pfView.draw();
    };

    this.step = function() {
        if (this.halted) {
            if (this.repeatIndefinitely) {
                pc.reset();
                this.halted = false;
            } else {
                return;
            }
        }
        var instruction = this.program.charAt(pc.x);
        switch (instruction) {
            case '+':
                // + -- equivalent to FD 1
                if (this.turtle.penDown) {
                    this.playfield.toggle(this.turtle.x, this.turtle.y);
                }
                this.turtle.advance();
                break;
            case '>':
                // > -- equivalent to RT 90; toggles PU/PD every 4 executions
                this.turtle.rotateClockwise();
                this.turtle.rotateClockwise();
                this.turtle.penCounter++;
                this.turtle.penCounter %= 4;
                if (this.turtle.penCounter === 0) {
                    this.turtle.penDown = !this.turtle.penDown;
                }
                break;
            case '[':
                // [ WHILE Begin a while loop
                if (this.playfield.get(this.turtle.x, this.turtle.y) === 0) {
                    // skip forwards to matching ]
                    var depth = 0;
                    for (;;) {
                        if (this.program.charAt(pc.x) == '[') {
                            depth++;
                        } else if (this.program.charAt(pc.x) == ']') {
                            depth--;
                            if (depth === 0)
                                break;
                        }
                        if (!pc.advance(this.program)) {
                            this.halted = true;
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
                    if (this.program.charAt(pc.x) == '[') {
                        depth--;
                    } else if (this.program.charAt(pc.x) == ']') {
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

        if (!pc.advance(this.program)) {
            this.halted = true;
        }

        this.draw();
    };

    this.reset = function(text) {
        this.playfield.clear();
        this.program = text;
        this.progView.setSourceText(this.program);
        this.turtle.reset();
        pc.reset();
        this.halted = false;
        this.draw();
    };

    this.setRepeatIndefinitely = function(value) {
        this.repeatIndefinitely = value;
    };
};
EtchaController.prototype = proto;
