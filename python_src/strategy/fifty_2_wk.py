import sys, json, logging, quandl
import pandas as pd

# if __name__ == "__main__":
# logging.basicConfig(level=logging.DEBUG, filename="logfile", filemode="a+",
#                        format="%(asctime)-15s %(levelname)-8s %(message)s")
logging.basicConfig(level=logging.DEBUG, filename="logfile",filemode="w",
                        format="%(message)s")



in_data = json.loads(sys.stdin.readlines()[0])


def check (curr):
	logging.info(curr)
	stk = curr['strategy_stock']
	
	data = quandl.Dataset('NSE/YESBANK').data(params={'limit':52,'rows':52,'order':'desc'})
	data_set  = data.to_pandas()
	logging.info(data_set.columns)

	cl_col = data_set['Close']
	cl_52_max = cl_col.max()
	cl_52_min = cl_col.min()

	logging.info('close max :%s\nclose min :%s',cl_52_max,cl_52_min)

	logging.info('close at 52 wk :%s',cl_52_max)
	ltp =  curr['close'] #curr['ltp'] or curr['close'] 

	signal = False
	if curr['transaction_type']=='BUY':
		if ltp <= cl_52_min * stk['buy_price_threshold']:
			signal = True
	if curr['transaction_type']=='SELL':
		if ltp >= cl_52 * stk['profit_margin']:
			action = True

	
	result = {}
	result['success'] = signal
	return result

print json.dumps(check(in_data))




# dataset_data = quandl.Dataset('WIKI/AAPL').data(params={ 'start_date':'2001-01-01', 'end_date':'2010-01-01', 'collapse':'annual', 'transformation':'rdiff', 'rows':4 })