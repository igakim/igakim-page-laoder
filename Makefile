install:
	npm install

lint:
	npm run eslint .

test:
	npm run test
test-coverage:
	npm run test -- --coverage

build:
	npm run build

publish:
	npm publish
