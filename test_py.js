var PythonShell = require('python-shell');
var should = require('should')

PythonShell.defaultOptions = {
	scriptPath: './python_src/'
}


var pyshell = new PythonShell('/strategy/fifty_2_wk.py', {
	mode: 'json'
});

var mock_dt = {
	"status": "success",
	"data": {
		"candles": [
			["2015-12-28T09:15:00+0530", 100, 100, 100, 100, 1000]
		]
	}
}

var columns = ['timestamp', 'open', 'high', 'low', 'close', 'volume']

var data = mock_dt.data.candles[0].reduce(function(result, field, index) {
	result[columns[index]] = field
	return result
}, {})

data.tradingsymbol='YESBANK'
data.transaction_type = 'BUY'
data.strategy_stock = {
			strategy_id: 'fifty_2_wk',
			tradingsymbol: 'YESBANK',
			stock_ceil: 0.4,
			nrr: 0.8,
			profit_margin: 1.1,
			buy_price_threshold: 1.25
		}

var count = 0;
pyshell.send(data)
pyshell.on('message', function(message) {
	// count === 0 && message.should.eql({
	// 	a: 'b'
	// });
	// count === 1 && should(message).eql(null);
	// count === 2 && message.should.eql([1, 2, 3, 4, 5]);
	console.log(count, ':', message)
	count++;
}).on('close', function() {
	console.log('total count:', count)
}).end(console.log);
