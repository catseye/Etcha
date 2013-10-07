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

/*
public class EtchaState implements State {
    public List<Error> step(World world) {
        ArrayList<Error> errors = new ArrayList<Error>();
        BasicCursor<BitElement> ip = (BasicCursor<BitElement>)pf.getCursor(0);
        char instruction = program.charAt(pc);
        switch (instruction) {
            case '+':
                // + -- equivalent to FD 1
                if (pendown) {
                    ip.set(ip.get().invert());
                }
                ip.advance();
                break;
            case '>':
                // > -- equivalent to RT 90; toggles PU/PD every 4 executions
                ip.rotate(90);
                pencounter++;
                pencounter %= 4;
                if (pencounter == 0) {
                    pendown = !pendown;
                }
                break;
            case '[':
                // [ WHILE Begin a while loop
                if (ip.get().isZero()) {
                    // skip forwards to matching ]
                    int depth = 0;
                    for (;;) {
                        if (program.charAt(pc) == '[') {
                            depth++;
                        } else if (program.charAt(pc) == ']') {
                            depth--;
                            if (depth == 0)
                                break;
                        }
                        pc++;
                        if (pc >= program.length()) {
                            halted = true;
                            return errors;
                        }
                    }
                }
                break;
            case ']':
                // ] END End a while loop
                // skip backwards to matching ]
                int depth = 0;
                for (;;) {
                    if (program.charAt(pc) == '[') {
                        depth--;
                    } else if (program.charAt(pc) == ']') {
                        depth++;
                    }
                    pc--;
                    if (depth == 0 || pc < 0)
                        break;
                }
                break;
            default:
                // NOP
                break;
        }

        pc++;
        if (pc >= program.length()) {
            halted = true;
        }

        return errors;
    }
}
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
    var canvas;
    var ctx;

    var p;
    var ip;
    var view;
    var program;
    var pc;
    var pendown;
    var pencounter;
    var halted;

    this.init = function(c) {
        canvas = c;
        p = new EtchaPlayfield();
        ip = new EtchaTurtle(0, 0, 0, -1);
        view = new EtchaPlayfieldView();
        view.init(p, canvas)
            .setCursors([ip])
            .setCellDimensions(12, 12);
        ctx = canvas.getContext('2d');
        this.load("");
    };

    this.draw = function() {
        view.draw();
    };

    this.step = function() {
        if (halted) return;
        var instruction = program.charAt(pc);
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
                if (ip.get() === 0) {
                    // skip forwards to matching ]
                    var depth = 0;
                    for (;;) {
                        if (program.charAt(pc) == '[') {
                            depth++;
                        } else if (program.charAt(pc) == ']') {
                            depth--;
                            if (depth === 0)
                                break;
                        }
                        pc++;
                        if (pc >= program.length) {
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
                    if (program.charAt(pc) == '[') {
                        depth--;
                    } else if (program.charAt(pc) == ']') {
                        depth++;
                    }
                    pc--;
                    if (depth === 0 || pc < 0)
                        break;
                }
                break;
            default:
                // NOP
                break;
        }

        pc++;
        if (pc >= program.length) {
            halted = true;
        }

        this.draw();
    };

    this.load = function(text) {
        p.clear();
        program = text;
        ip.x = 0;
        ip.y = 0;
        ip.dx = 0;
        ip.dy = -1;
        pendown = true;
        pencounter = 0;
        halted = false;
        pc = 0;
        this.draw();
    };
};
EtchaController.prototype = new yoob.Controller();
