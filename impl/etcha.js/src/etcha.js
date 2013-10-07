/*
 * An EtchaController implements the semantics of Etcha.
 * ALTHOUGH IT SHOULD BE NOTED, THAT, CURRENTLY THE SEMANTICS
 * IMPLEMENTED, BY ETCHACONTROLLER ARE SUSPICIOUSLY SIMILAR TO
 * THE SMENATICS OF GEMOOY AND, NOT, AT ALL RESEMBLE ETCHA YET.
 * The source code in this file has been placed into the public domain.
 */

/*
class Etcha extends TextBasedLanguage<EtchaState> {
    public String getName() {
        return "Etcha";
    }

    public int numPlayfields() {
        return 1;
    }

    public int numTapes() {
        return 0;
    }

    public boolean hasInput() {
        return false;
    }

    public boolean hasOutput() {
        return false;
    }

    public EtchaState importFromText(String text) {
        EtchaState s = new EtchaState();
        s.setProgramText(text);
        return s;
    }

    private static final String[][] properties = {
        {"Author", "Chris Pressey"},
        {"Implementer", "Chris Pressey"},
        {"Implementation notes",
         "This implementation uses a yoob playfield as data " +
         "store/output."},
    };

    public String[][] getProperties() {
        return properties;
    }
}

class EtchaPlayfield extends BasicPlayfield<BitElement> {
    protected BasicCursor<BitElement> turtle;
    public EtchaPlayfield() {
        super(BitElement.ZERO);
        this.turtle = new BasicCursor<BitElement>(this);
        turtle.setDelta(0, -1);
        clear();
    }

    public EtchaPlayfield clone() {
        EtchaPlayfield c = new EtchaPlayfield();
        c.copyBackingStoreFrom(this);
        c.turtle = turtle.clone();
        c.turtle.setPlayfield(c);
        return c;
    }

    public int numCursors() {
        return 1;
    }

    public BasicCursor<BitElement> getCursor(int index) {
        if (index == 0)
            return turtle;
        return null;
    }
}

class EtchaPlayfieldView extends BasicPlayfieldView {
    public void render(Graphics g, Element e, int x, int y, int w, int h) {
        BitElement be = (BitElement)e;
        if (be.getBoolean()) {
            g.setColor(Color.black);
        } else {
            g.setColor(Color.white);
        }
        g.fillRect(x, y, w, h);
    }

    public void render(Graphics g, Cursor c, int x, int y, int w, int h) {
        g.setColor(Color.blue);
        g.drawRoundRect(x - 1, y - 1, w + 2, h + 2, w / 4, h / 4);
        if (c instanceof BasicCursor) {
            BasicCursor bc = (BasicCursor)c;
            int cx = x + (w/2);
            int cy = y + (h/2);
            int dx = bc.getDeltaX().intValue();
            int dy = bc.getDeltaY().intValue();
            int ex = cx + (dx * w);
            int ey = cy + (dy * h);
            g.drawLine(cx, cy, ex, ey);
        }
    }
}

public class EtchaState implements State {
    protected EtchaPlayfield pf;
    protected EtchaPlayfieldView pfView;
    protected int pencounter = 0;
    protected boolean pendown = true;
    protected boolean halted = false;
    protected String program;
    protected int pc = 0;
    private static final Etcha language = new Etcha();

    public EtchaState() {
        pf = new EtchaPlayfield();
        BasicCursor<BitElement> ip = (BasicCursor<BitElement>)pf.getCursor(0);
        ip.setDelta(0, -1);
        pfView = new EtchaPlayfieldView();
    }
    
    public Language getLanguage() {
        return language;
    }

    public EtchaState clone() {
        EtchaState c = new EtchaState();
        c.pf = pf.clone();
        c.program = program;
        c.pc = pc;
        c.halted = halted;
        c.pencounter = pencounter;
        c.pendown = pendown;
        return c;
    }

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

    public Playfield getPlayfield(int index) {
        if (index == 0)
            return pf;
        return null;
    }

    public Tape getTape(int index) {
        return null;
    }

    public String getProgramText() {
        return program;
    }

    public int getProgramPosition() {
        return pc;
    }

    public List<Error> setProgramText(String text) {
        ArrayList<Error> errors = new ArrayList<Error>();
        program = text;
        return errors;
    }

    public View getPlayfieldView(int index) {
        if (index == 0)
            return pfView;
        return null;
    }

    public View getTapeView(int index) {
        return null;
    }

    public String exportToText() {
        return program;
    }

    public boolean hasHalted() {
        return halted;
    }

    public boolean needsInput() {
        return false;
    }

    public void setOption(String name, boolean value) {
    }
}
*/


/*
 * requires yoob.Controller
 * requires yoob.Playfield
 * requires yoob.Cursor
 */
function EtchaPlayfield() {
    this.setDefault(' ');

    this.increment = function(x, y) {
        var data = this.get(x, y);
        if (data === ' ') {
            data = '#';
        } else if (data === '#') {
            data = '@';
        } else if (data === '@') {
            data = ' ';
        }
        this.put(x, y, data);
    };

    this.decrement = function(x, y) {
        var data = this.get(x, y);
        if (data === ' ') {
            data = '@';
        } else if (data === '@') {
            data = '#';
        } else if (data === '#') {
            data = ' ';
        }
        this.put(x, y, data);
    };
};
EtchaPlayfield.prototype = new yoob.Playfield();


function EtchaController() {
    var intervalId;
    var canvas;
    var ctx;

    var p;
    var ip;
    var dp;

    this.init = function(c) {
        p = new EtchaPlayfield();

        ip = new yoob.Cursor(0, 0, 1, 1);
        ip.drawContext = function(ctx, x, y, cellWidth, cellHeight) {
            ctx.fillStyle = "#ff5080";
            ctx.fillRect(x, y, cellWidth, cellHeight);
        };

        dp = new yoob.Cursor(0, 0, 0, 0);
        dp.drawContext = function(ctx, x, y, cellWidth, cellHeight) {
            ctx.fillStyle = "#50ff80";
            ctx.fillRect(x, y, cellWidth, cellHeight);
        };
        canvas = c;
        ctx = canvas.getContext('2d');
    };

    this.draw = function() {
        p.drawCanvas(canvas, undefined, 20, [ip, dp]);
    };

    this.step = function() {
        var instr = p.get(ip.x, ip.y);

        if (instr === '@') {
            var data = p.get(dp.x, dp.y);
            if (data === ' ') {
                ip.rotateClockwise();
            } else if (data == '#') {
                ip.rotateCounterclockwise();
            }
        } else if (instr === '#') {
            if (ip.isHeaded(0, -1)) {
                dp.y--;
                ip.advance();
            } else if (ip.isHeaded(0, 1)) {
                dp.y++;
                ip.advance();
            } else if (ip.isHeaded(1, 0)) {
                dp.x++;
                ip.advance();
            } else if (ip.isHeaded(-1, 0)) {
                dp.x--;
                ip.advance();
            } else if (ip.isHeaded(-1, -1) || ip.isHeaded(1, -1)) {
                p.increment(dp.x, dp.y);
            } else if (ip.isHeaded(-1, 1) || ip.isHeaded(1, 1)) {
                p.decrement(dp.x, dp.y);
            }
        }

        ip.advance();
        this.draw();
    };

    this.load = function(text) {
        p.clear();
        p.load(0, 0, text);
        p.foreach(function (x, y, value) {
            if (value === '$') {
                ip.x = x;
                ip.y = y;
                return ' ';
            } else if (value === '%') {
                dp.x = x;
                dp.y = y;
                return ' ';
            }
        });
        ip.dx = 1;
        ip.dy = 1;
        this.draw();
    };
};
EtchaController.prototype = new yoob.Controller();
