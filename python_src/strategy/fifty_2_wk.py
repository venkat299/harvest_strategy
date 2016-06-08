import sys, json, logging, quandl
import pandas as pd

quandl.ApiConfig.api_key = '1CzVT1zp5yzCQjQNq8yR'
# if __name__ == "__main__":
# logging.basicConfig(level=logging.DEBUG, filename="logfile", filemode="a+",
#                        format="%(asctime)-15s %(levelname)-8s %(message)s")
#logging.basicConfig(level=#logging.DEBUG, filename="logfile.log",filemode="w",format="%(message)s")

lines = sys.stdin.readlines()
#logging.info('input lines:%s data:%s',len(lines),lines)
in_data = json.loads(lines[len(lines)-1])


def check (curr):
	#logging.info(curr)
	stk = curr['strategy_stock']
	####### data retrieval part ###########
	#-> data = quandl.Dataset('NSE/YESBANK').data(params={'limit':52,'rows':52,'order':'desc'})
	#-> data_set  = data.to_pandas()
	#logging.info(data_set.columns)
	####### data retrieval part end ###########

	#-> cl_col = data_set['Close']
	cl_52_max = 1049.9 ## cl_col.max()
	cl_52_min = 799.5 ## cl_col.min()
	prev_buy_price = stk['prev_buy_price']

	#logging.info('close max :%s\nclose min :%s',cl_52_max,cl_52_min)

	#logging.info('close at 52 wk :%s',cl_52_max)
	ltp =  curr['close'] #curr['ltp'] or curr['close'] 

	signal = False
	if curr['transaction_type']=='BUY':
		if ltp <= cl_52_min * stk['buy_price_threshold']:
			signal = True
	if curr['transaction_type']=='SELL':
		if ltp >= prev_buy_price * stk['profit_margin']:
			signal = True

	
	result = {}
	result['success'] = signal
	return result

print json.dumps(check(in_data))

# result = {}
# result['success'] = False
# print json.dumps(result)



# dataset_data = quandl.Dataset('WIKI/AAPL').data(params={ 'start_date':'2001-01-01', 'end_date':'2010-01-01', 'collapse':'annual', 'transformation':'rdiff', 'rows':4 })