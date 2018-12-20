install:
	npm install

lint:
	npm run eslint .

test:
	npm run test
test-watch:
	npm run test -- --watch
test-coverage:
	npm run test -- --coverage

build:
	npm run build

publish:
	npm publish
