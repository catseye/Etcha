The Etcha Programming Language
==============================

Introduction
------------

Etcha is an esoteric programming language based on Jeffry Johnston's
[BitChanger](http://www.esolangs.org/wiki/BitChanger). Like BitChanger,
Etcha has four instructions, two of which are used to form
Brainfuck-like while-loops. Unlike BitChanger, Etcha has a 2-dimensional
storage model based on turtle graphics, which permits it to be
immediately used for an alternative purpose: graphical composition.
Unlike a classical turtle in a language such as LOGO however, the turtle
in Etcha is an integral part of the computation, playing a role similar
to the tape head of a Turing machine.

Instructions
------------

-   `+` -- equivalent to FD 1
-   `>` -- equivalent to RT 90; toggles PU/PD every 4 executions
-   `[` -- equivalent to While
-   `]` -- equivalent to Wend

In Etcha, instructions control a turtle. The turtle exists vis-a-vis an
unbounded Cartesian grid called the playfield. The turtle has a position
in that it occupies exactly one of the points on the playfield (which
are referred to as pixels). Each pixel has a state, which is either
black or white; all pixels are initially black.

The turtle also has an orientation which describes the direction it
would move in should it travel forward. Unlike a conventional turtle,
because of its Cartesian context, there are only four possible
orientations which the Etcha turtle can possess: north, east, south, and
west, corresponding to headings of 0, 90, 180, and 270 degrees. When an
Etcha program starts, the turtle is initially oriented north. Because
position is relative, it doesn't matter where the turtle is initially
located, but solely for psychological satisfaction we can say that it is
initially situated in the very center of this unbounded Cartesian grid.

The turtle is also equipped with a pen, which has a pen mode and a pen
position. The pen mode is always XOR, meaning that when moving forward
by execution of `+`, the state of the pixel that was previously occupied
by the turtle gets inverted (from black to white, or vice versa.) The
pen position may be up or down. It is initially down. Every fourth time
an `>` instruction is executed, the pen's position is toggled from up to
down or vice versa. These executions need not be consecutive; there may
be any number of intervening instructions executed.

Computational Class
-------------------

Etcha is Turing-complete if BitChanger is, because we can easily
translate any BitChanger program into an equivalent Etcha program. Let
the Etcha program begin with `>>>>`, to initially lift the pen. The
BitChanger instruction `<` is translated to the Etcha instructions
`>>>+>>>>>`, and the BitChanger instruction `}` is translated to
`>>>>>+>>>`. The instructions `[` and `]` remain the same. The relation
between the BitChanger tape state and the Etcha playfield is quite
literal; the y dimension of the grid is simply ignored.

Implementation
--------------

In a particular implementation of Etcha on a microcomputer with a finite
storage, the playfield cannot be truly unbounded, and there will come a
point in a long enough program execution, entirely dependent on the
capabilities of the hardware and the implementation, where a pixel
change cannot be correctly stored. The behaviour after this point is
undefined. *Such (m)icro(c)omputer implementations of Etcha may be
marketed under the name "MC Etcha"*.

Cat's Eye Technologies provides an implementation of Etcha written in
the Java[TM] programming language. This implementation attempts to
demonstrate that the Model-View-Controller design pattern can be applied
not only to user interfaces, but also to programming language
interpreters. The Model is the state of the program (which is also the
state of the Turtle graphics engine.) The View is the interpreter's
interpretation of that state, and the Controller is the interpreter's
behaviour with respect to the View. For example, the Model exposes the
pen up/down semantics, but it is the Controller that implements the rule
that `>>>>` toggles the pen position.

Cat's Eye Technologies' ridiculously over-engineering implementation of
Etcha is in the public domain.

Happy Etchin'!  
Chris Pressey  
October 4th, 2009  
Mold City, USA
