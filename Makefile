JAVAC?="/cygdrive/c/Program Files/Java/jdk1.6.0_02/bin/javac"
JAVA?="/cygdrive/c/Program Files/Java/jre1.6.0_07/bin/java"

all: bin/tc/catseye/etcha/Executor.class

bin/tc/catseye/etcha/Executor.class: src/Etcha.java
	$(JAVAC) -cp bin -d bin src/Etcha.java

clean:
	rm bin/tc/catseye/etcha/*.class

test: bin/tc/catseye/etcha/Executor.class
	$(JAVA) -cp bin tc.catseye.etcha.Main eg/test.etcha
