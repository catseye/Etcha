JAVAC?=javac
JAVA?=java

all: bin/tc/catseye/etcha/Executor.class

bin:
	mkdir -p bin

bin/tc/catseye/etcha/Executor.class: bin src/Etcha.java
	$(JAVAC) -cp bin -d bin src/Etcha.java

clean:
	rm -f bin/tc/catseye/etcha/*.class

test: bin/tc/catseye/etcha/Executor.class
	$(JAVA) -cp bin tc.catseye.etcha.Main eg/test.etcha
