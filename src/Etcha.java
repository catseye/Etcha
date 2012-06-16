package tc.catseye.etcha;

// Etcha.java
// Ridiculous over-implementation of the Etcha programming language.
// I hereby place this work into the public domain.
// Chris Pressey, Cat's Eye Technologies.
// $Id: Etcha.java 257 2009-10-04 03:21:43Z cpressey $

import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;
import java.util.Set;
import java.util.HashSet;
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;

interface Grid
{
    void togglePixel(int x, int y);
    boolean isPixelBlack(int x, int y);
}

class DefaultGrid implements Grid
{
    private HashMap<Integer, HashMap<Integer, Boolean>> grid;
    private int minX, minY, maxX, maxY;
  
    DefaultGrid()
    {
        grid = new HashMap<Integer, HashMap<Integer, Boolean>>();
        minX = minY = maxX = maxY = 0;
    }

    private static boolean getBoolean(Boolean b)
    {
        return b == null ? false : b;
    }

    public void togglePixel(int x, int y)
    {
        HashMap<Integer, Boolean> column = grid.get(x);
        if (column == null) {
            column = new HashMap<Integer, Boolean>();
            column.put(y, true);
            grid.put(x, column);
        } else {
            column.put(y, !getBoolean(column.get(y)));
        }
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
    }

    public boolean isPixelBlack(int x, int y)
    {
        HashMap<Integer, Boolean> column = grid.get(x);
        if (column == null) {
            return false;
        } else {
            return getBoolean(column.get(y));
        }
    }
    
    public void dump()
    {
        int width = maxY - minY;
        for (int i = 0; i <= width; i++)
            System.out.print("-");
        System.out.println();
        for (int y = minY; y <= maxY; y++) {
            for (int x = minX; x <= maxX; x++) {
                System.out.print(isPixelBlack(x, y) ? "#" : " ");
            }
            System.out.println();
        }
        for (int i = 0; i <= width; i++)
            System.out.print("-");
        System.out.println();
    }
}

interface Turtle
{
    void forward(int distance);
    void rotate(int degrees);
    void setPenDown(boolean penDown);
    public boolean isPenDown();
    boolean detectPixel();
}

class DefaultTurtle implements Turtle
{
    private Grid grid;
    private int x, y;
    private int dx, dy;
    private boolean penDown;
    private int heading;

    DefaultTurtle()
    {
        grid = new DefaultGrid();
        x = 0;
        y = 0;
        penDown = true;
        heading = 0;
    }

    DefaultTurtle(Grid g)
    {
        grid = g;
        x = 0;
        y = 0;
        penDown = true;
        heading = 0;
    }

    public void forward(int distance)
    {
        for (int i = 0; i < distance; i++) {
            if (penDown)
                grid.togglePixel(x, y);
            x += dx();
            y += dy();
        }
    }

    private int dx()
    {
        if (heading == 90)
            return 1;
        if (heading == 270)
            return -1;
        return 0;
    }

    private int dy()
    {
        if (heading == 0)
            return -1;
        if (heading == 180)
            return 1;
        return 0;
    }

    public void rotate(int degrees)
    {
        heading += degrees;
        heading %= 360;
    }

    public void setPenDown(boolean penDown)
    {
        this.penDown = penDown;
    }

    public boolean isPenDown()
    {
        return penDown;
    }
    
    public boolean detectPixel()
    {
        return grid.isPixelBlack(x, y);
    }
}

interface Counter
{
    public boolean count();
}

class DefaultCounter implements Counter
{
    private int modulus;
    private int counter;
  
    DefaultCounter()
    {
        modulus = 4;
        counter = 0;
    }

    DefaultCounter(int m)
    {
        modulus = m;
        counter = 0;
    }

    DefaultCounter(int m, int c)
    {
        modulus = m;
        counter = c;
    }

    public boolean count()
    {
        counter++;
        counter %= modulus;
        return (counter == 0);
    }
}

// An execution context knows what command it is currently executing.
interface ExecutionContext
{
    Turtle getTurtle();
    Counter getCounter();
    ExecutionContext step();
}

class BaseExecutionContext implements ExecutionContext
{
    protected Turtle turtle;
    protected Counter counter;
    protected ExecutionContext parent;

    BaseExecutionContext(Turtle t, Counter c)
    {
        turtle = t;
        counter = c;
        parent = null;
    }

    BaseExecutionContext(ExecutionContext parent)
    {
        turtle = parent.getTurtle();
        counter = parent.getCounter();
        this.parent = parent;
    }

    public Turtle getTurtle()
    {
        return turtle;
    }
    
    public Counter getCounter()
    {
        return counter;
    }
    
    public ExecutionContext step()
    {
        return parent;
    }
}

class PrimitiveExecutionContext extends BaseExecutionContext
{
    protected Command cmd;

    PrimitiveExecutionContext(Command cmd, ExecutionContext parent)
    {
        super(parent);
        this.cmd = cmd;
    }

    public ExecutionContext step()
    {
        cmd.execute(turtle, counter);
        return parent;
    }
}

class BlockExecutionContext extends PrimitiveExecutionContext
{
    protected int pos;
    protected Block cmd;

    BlockExecutionContext(Block cmd, ExecutionContext parent)
    {
        super(cmd, parent);
        this.cmd = cmd;  // because our cmd is not our parent's!
        pos = 0;
    }

    public ExecutionContext step()
    {
        Command sub = cmd.get(pos);
        if (sub == null) {
            return parent;
        }
        pos++;
        ExecutionContext e = sub.createExecutionContext(this);
        // Could just return e here.  But then we'd have to do twice as many
        // steps, stepping into each contained command
        return e.step();
    }
}

class LoopExecutionContext extends BlockExecutionContext
{
    protected Loop cmd;

    LoopExecutionContext(Loop cmd, ExecutionContext parent)
    {
        super(cmd, parent);
        this.cmd = cmd;  // because our cmd is not our parent's!
    }

    public ExecutionContext step()
    {
        if (pos >= cmd.size()) {
            pos = 0;
        }
        if (pos == 0 && !turtle.detectPixel()) {
            return parent;
        }
        return super.step();
    }
}

interface Command
{
    void execute(Turtle t, Counter c);
    ExecutionContext createExecutionContext(ExecutionContext parent);
}

abstract class AbstractCommand implements Command
{
    abstract public void execute(Turtle t, Counter c);
    public ExecutionContext createExecutionContext(ExecutionContext parent)
    {
        return new PrimitiveExecutionContext(this, parent);
    }
}

class Right extends AbstractCommand
{
    public void execute(Turtle t, Counter c)
    {
        t.rotate(90);
        if (c.count())
            t.setPenDown(!t.isPenDown());
    }
}

class Forward extends AbstractCommand
{
    public void execute(Turtle t, Counter c)
    {
        t.forward(1);
    }
}

class Block extends AbstractCommand
{
    private List<Command> cmds;

    Block(List<Command> cmds)
    {
        this.cmds = cmds;
    }
    
    public Command get(int index)
    {
        try {
            return cmds.get(index);
        } catch (IndexOutOfBoundsException e) {
            return null;
        }
    }

    public int size()
    {
        return cmds.size();
    }

    public void execute(Turtle t, Counter c)
    {
        for (Command cmd : cmds) {
            cmd.execute(t, c);
        }
    }

    public ExecutionContext createExecutionContext(ExecutionContext parent)
    {
        return new BlockExecutionContext(this, parent);
    }
}

class Loop extends Block
{
    Loop(List<Command> cmds)
    {
        super(cmds);
    }

    public void execute(Turtle t, Counter c)
    {
        while (t.detectPixel()) {
            super.execute(t, c);
        }
    }

    public ExecutionContext createExecutionContext(ExecutionContext parent)
    {
        return new LoopExecutionContext(this, parent);
    }
}

class Executor
{
    Turtle turtle;
    Counter counter;

    Executor()
    {
        turtle = new DefaultTurtle();
        counter = new DefaultCounter();
    }
    
    Executor(Turtle t, Counter c)
    {
        turtle = t;
        counter = c;
    }

    Executor(Grid g)
    {
        turtle = new DefaultTurtle(g);
        counter = new DefaultCounter();
    }

    public void run(Command program)
    {
        program.execute(turtle, counter);
    }
    
    // same as run, but uses the step methods
    public void stepAll(Command program)
    {
        ExecutionContext base = new BaseExecutionContext(turtle, counter);
        ExecutionContext e = program.createExecutionContext(base);
        while (e != base) {
            e = e.step();
        }
    }
}

interface Warner
{
    void warn(String warning);
}

interface ParseFactory<X>
{
    char getRepresentation();
    X generate(Parser p);
}

abstract class AbstractParseFactory<X> implements ParseFactory<X>
{
    public abstract char getRepresentation();
    public abstract X generate(Parser p);
}

class ForwardParseFactory extends AbstractParseFactory<Command>
{
    public char getRepresentation()
    {
        return '+';
    }
    
    public Command generate(Parser p)
    {
        return new Forward();
    }
}

class RightParseFactory extends AbstractParseFactory<Command>
{
    public char getRepresentation()
    {
        return '>';
    }
    
    public Command generate(Parser p)
    {
        return new Right();
    }
}

class LoopParseFactory extends AbstractParseFactory<Command>
{
    public char getRepresentation()
    {
        return '[';
    }
    
    public Command generate(Parser p)
    {
        p.advance();
        Set<Character> until = new HashSet<Character>();
        until.add(new Character(']'));
        List<Command> cmds = p.parseMany(until);
        return new Loop(cmds);
    }
}

class Parser
{
    private String str;
    private int pos;
    private Warner warner;
    private Map<Character,ParseFactory<Command>> factoryMap;

    Parser(String s)
    {
        str = s;
        pos = 0;
        warner = null;
        factoryMap = new HashMap<Character,ParseFactory<Command>>();
        ArrayList<ParseFactory<Command>> factories = new ArrayList<ParseFactory<Command>>();
        factories.add(new ForwardParseFactory());
        factories.add(new RightParseFactory());
        factories.add(new LoopParseFactory());
        for (ParseFactory<Command> factory : factories) {
            factoryMap.put(factory.getRepresentation(), factory);
        }
    }

    public void setWarner(Warner w)
    {
        warner = w;
    }

    public void advance()
    {
        pos++;
    }

    public Command parseOne()
    {
        char c = str.charAt(pos);
        Command cmd = null;

        ParseFactory<Command> factory = factoryMap.get(c);
        if (factory != null) {
            cmd = factory.generate(this);
        } else if (warner != null) {
            warner.warn("unrecognized command '" + c +
                        "' at position " + pos);
        }
        advance();

        return cmd;
    }

    public List<Command> parseMany(Set<Character> until)
    {
        List<Command> cmds = new ArrayList<Command>();

        while (pos < str.length()) {
            char c = str.charAt(pos);
            if (until != null && until.contains(c))
                break;
            Command cmd = parseOne();
            if (cmd != null)
                cmds.add(cmd);
        }
        
        return cmds;
    }
}

// A command-line interface to our Etcha interpreter.
class Main
{
    static public void main(String argv[])
    {
        // parse command line arguments
        for (String arg : argv)
            loadAndInterpret(arg);
    }
    
    static void loadAndInterpret(String filename)
    {
        // open and read file
        StringBuffer fileContents = new StringBuffer();
        try {
            BufferedReader input = new BufferedReader(new FileReader(filename));
            String str;
            str = input.readLine();
            while (str != null) {
                fileContents.append(str);
                str = input.readLine();
            }
            input.close();
        } catch (IOException e) {
            System.err.println("Couldn't read '" + filename + "'");
            return;
        }
        Parser parser = new Parser(fileContents.toString());
        Set<Character> empty = new HashSet<Character>();
        Block program = new Block(parser.parseMany(empty));
        DefaultGrid grid = new DefaultGrid();
        Executor executor = new Executor(grid);
        executor.stepAll(program);
        grid.dump();
    }
}
