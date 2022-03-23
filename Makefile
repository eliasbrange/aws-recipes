DIAGRAMS := $(patsubst %.py,%.png,$(wildcard */diagram.py))

%/diagram.png: %/diagram.py
	FILENAME=$(patsubst %.py,%,$^) python3 $^


.PHONY: diagrams
diagrams: $(DIAGRAMS)
