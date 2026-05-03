const assert = require('node:assert/strict');
const test = require('node:test');

const { handleBoxOperations } = require('../dist/nodes/Streak/operations/boxOperations');

function createContext(parameters, responses) {
	const calls = [];

	return {
		calls,
		getNode() {
			return { name: 'Streak' };
		},
		getNodeParameter(name, _itemIndex, defaultValue) {
			return Object.prototype.hasOwnProperty.call(parameters, name)
				? parameters[name]
				: defaultValue;
		},
		helpers: {
			async httpRequestWithAuthentication(credentialsType, requestOptions) {
				calls.push({ credentialsType, requestOptions });
				if (responses.length === 0) {
					throw new Error(`Unexpected request to ${requestOptions.url}`);
				}
				return responses.shift();
			},
		},
		logger: {
			warn() {},
		},
	};
}

test('createBox sends JSON-stringified email assignment entries', async () => {
	const context = createContext(
		{
			pipelineKey: { mode: 'list', value: 'pipe_1' },
			boxName: 'New Deal',
			stageKey: '',
			additionalFields: {
				assignedToSharingEntries: ['ada@example.com', 'grace@example.com'],
			},
		},
		[{ key: 'box_1' }],
	);

	await handleBoxOperations.call(context, 'createBox', 0);

	assert.equal(context.calls.length, 1);
	const request = context.calls[0].requestOptions;
	assert.equal(request.method, 'POST');
	assert.equal(request.url, 'https://api.streak.com/api/v2/pipelines/pipe_1/boxes');
	assert.equal(
		request.body.assignedToSharingEntries,
		JSON.stringify([{ email: 'ada@example.com' }, { email: 'grace@example.com' }]),
	);
});

test('updateBox sends user-key assignment entries as a string array', async () => {
	const context = createContext(
		{
			boxKey: 'box_1',
			updateFields: {
				assignedToSharingEntries: ['user_1', 'user_2'],
			},
		},
		[{ key: 'box_1' }],
	);

	await handleBoxOperations.call(context, 'updateBox', 0);

	assert.equal(context.calls.length, 1);
	const request = context.calls[0].requestOptions;
	assert.equal(request.method, 'POST');
	assert.equal(request.url, 'https://api.streak.com/api/v1/boxes/box_1');
	assert.deepEqual(request.body.assignedToSharingEntries, ['user_1', 'user_2']);
});

test('getTimeline sends filters as a repeated array query parameter', async () => {
	const context = createContext(
		{
			boxKey: 'box_1',
			direction: 'Descending',
			timelineFilters: ['CALL_LOGS', 'COMMENTS'],
			startTimestamp: '',
			returnAll: false,
			limit: 25,
		},
		[{ entries: [{ key: 'entry_1' }] }],
	);

	const result = await handleBoxOperations.call(context, 'getTimeline', 0);

	assert.deepEqual(result, [{ key: 'entry_1' }]);
	assert.equal(context.calls.length, 1);
	const request = context.calls[0].requestOptions;
	assert.equal(request.arrayFormat, 'repeat');
	assert.deepEqual(request.qs, {
		direction: 'Descending',
		filters: ['CALL_LOGS', 'COMMENTS'],
		limit: 25,
	});
});

test('listBoxes flattens paginated results and follows hasNextPage', async () => {
	const context = createContext(
		{
			pipelineKey: { mode: 'list', value: 'pipe_1' },
			stageKeyFilter: '',
			searchQuery: '',
			sortBy: 'lastUpdatedTimestamp',
			returnAll: true,
			limit: 50,
		},
		[
			{ results: [{ key: 'box_1' }], hasNextPage: true },
			{ results: [{ key: 'box_2' }], hasNextPage: false },
		],
	);

	const result = await handleBoxOperations.call(context, 'listBoxes', 0);

	assert.deepEqual(result, [{ key: 'box_1' }, { key: 'box_2' }]);
	assert.equal(context.calls.length, 2);
	assert.deepEqual(context.calls.map((call) => call.requestOptions.qs.page), [0, 1]);
	assert.deepEqual(context.calls.map((call) => call.requestOptions.qs.limit), [100, 100]);
});
