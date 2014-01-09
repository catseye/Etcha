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


function EtchaPlayfieldView() {
    this.drawCell = function(ctx, value, playfieldX, playfieldY,
                             canvasX, canvasY, cellWidth, cellHeight) {
        ctx.fillStyle = value === 0 ? "white" : "black";
        ctx.fillRect(canvasX, canvasY, cellWidth, cellHeight);
    };
};
EtchaPlayfieldView.prototype = new yoob.PlayfieldCanvasView();


function EtchaTurtle() {
};
EtchaTurtle.prototype = new yoob.Cursor();


function EtchaController() {
    var intervalId;

    var p;
    var ip;
    var program;
    var progPf;
    var pc;
    var pendown;
    var pencounter;
    var halted;

    this.init = function(pfView, progView) {
        p = new EtchaPlayfield();
        ip = new EtchaTurtle(0, 0, 0, -1);
        pc = new yoob.Cursor(0, 0, 1, 0);

        this.pfView = pfView;
        this.pfView.pf = p;
        this.pfView.setCursors([ip]);

        this.progView = progView;
        progPf = new yoob.Playfield();
        progPf.setDefault(' ');
        this.progView.pf = progPf;
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
                if (pendown) {
                    p.toggle(ip.x, ip.y);
                }
                ip.advance();
                break;
            case '>':
                // > -- equivalent to RT 90; toggles PU/PD every 4 executions
                ip.rotateClockwise();
                ip.rotateClockwise();
                pencounter++;
                pencounter %= 4;
                if (pencounter === 0) {
                    pendown = !pendown;
                }
                break;
            case '[':
                // [ WHILE Begin a while loop
                if (p.get(ip.x, ip.y) === 0) {
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
                        pc.advance();
                        if (pc.x >= program.length) {
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

        pc.advance();
        if (pc.x >= program.length) {
            halted = true;
        }

        this.draw();
    };

    this.load = function(text) {
        p.clear();
        program = text;
        progPf.clear();
        progPf.load(0, 0, text);
        ip.x = 0;
        ip.y = 0;
        ip.dx = 0;
        ip.dy = -1;
        pc.x = 0;
        pc.y = 0;
        pc.dx = 1;
        pc.dy = 0;
        pendown = true;
        pencounter = 0;
        halted = false;
        this.draw();
    };
};
EtchaController.prototype = new yoob.Controller();
