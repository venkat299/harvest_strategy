REPORTER = spec

all: jshint test

test:
	@NODE_ENV=test ./node_modules/.bin/mocha --recursive --reporter $(REPORTER) --timeout 3000

jshint:
	jshint lib examples test index.js

tests: test

tap:
	@NODE_ENV=test ./node_modules/.bin/mocha -R tap > results.tap

unit:
	@NODE_ENV=test ./node_modules/.bin/mocha --recursive -R xunit > results.xml --timeout 3000

skel:
	mkdir examples lib test
	touch index.js
	npm install mocha chai --save-dev
	npm install mocha --save-dev

.PHONY: test tap unit jshint skel

git_general_commit:
	git add --all
	git commit -m code_changed_to_accomodate_other_api_requirement
	git push


test-coveralls:
	@NODE_ENV=test istanbul cover ./node_modules/mocha/bin/_mocha --report lcovonly -- --recursive -R spec && cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js && rm -rf ./coverage

cover_local:
		istanbul cover _mocha -- --recursive  -R spec

test_local:
		export PYTHONPATH="/opt/local/Library/Frameworks/Python.framework/Versions/2.7/lib/python2.7/site-packages"
		clear && printf '\e[3J'; mocha  --recursive -R  "spec"