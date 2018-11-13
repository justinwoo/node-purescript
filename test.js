'use strict';

const {EOL} = require('os');
const {execFile} = require('child_process');
const {lstat} = require('fs');
const {promisify} = require('util');
const {join} = require('path');

const extractSemver = require('semver').coerce;
const purescript = require('.');
const test = require('tape');
const {bin, scripts} = require('./package.json');

const promisifiedExecFile = promisify(execFile);

test('`bin` field of package.json', t => {
	t.deepEqual(
		Object.keys(bin),
		['purs'],
		'should only include a single path.'
	);

	t.end();
});

test('Node.js API', t => {
	t.equal(
		typeof purescript,
		'string',
		'should expose a string.'
	);

	t.equal(
		purescript,
		join(__dirname, bin.purs),
		'should be equal to the binary path.'
	);

	t.end();
});

test('`prepublishOnly` script', async t => {
	await promisifiedExecFile('npm', ['run', 'prepublishOnly'], {shell: process.platform === 'win32'});
	const stat = await promisify(lstat)(purescript);

	t.ok(
		stat.isFile(),
		'should create a placeholder file.'
	);

	t.ok(
		stat.size < 250,
		'should create a sufficiently small file.'
	);

	t.end();
});

test('`postinstall` script', async t => {
	await promisifiedExecFile('npm', ['run', 'postinstall'], {shell: process.platform === 'win32'});

	t.equal(
		(await promisifiedExecFile(purescript, ['--version'])).stdout,
		`${extractSemver(scripts.postinstall).toString()}${EOL}`,
		'should install a PureScript binary.'
	);

	t.end();
});
