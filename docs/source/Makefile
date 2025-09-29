outdir := html

doc:
	cp ../../garak/data/calibration/calibration.json . 
	python -m sphinx -T -E -b html -d _build/doctrees -D language=en ./ $(outdir)

clean:
	rm -f calibration.json
	rm -rf $(outdir) generated _build

cliref:
	echo "CLI reference for garak" > cliref.rst
	echo "=======================" >> cliref.rst
	echo >> cliref.rst
	echo "::" >> cliref.rst
	echo >> cliref.rst
	cd ../.. ; python3 -m garak --help | sed 's/^/  /' >> docs/source/cliref.rst

all: clean cliref doc
