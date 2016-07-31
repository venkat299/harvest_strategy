import sys, json, logging, quandl
import pandas as pd
# encoding=utf8 #ISO-8859-1 
reload(sys)
sys.setdefaultencoding("ISO-8859-1")

quandl.ApiConfig.api_key = '1CzVT1zp5yzCQjQNq8yR'
# if __name__ == "__main__":
#logging.basicConfig(level=logging.DEBUG, filename="logfile", filemode="a+",
#                       format="%(asctime)-15s %(levelname)-8s %(message)s")
logging.basicConfig(level=logging.DEBUG, filename="logfile.log",filemode="a+",format="%(message)s")

lines = sys.stdin.readlines()
#logging.info('input lines:%s data:%s',len(lines),lines)
in_data = json.loads(lines[len(lines)-1])


def check (curr):
	#logging.info(curr)
	stk = curr['strategy_stock']
	isTestEnv = ('testing' in curr) and curr.get('testing') # check if test env is true
	####### data retrieval part ###########
	#-> data = quandl.Dataset('NSE/YESBANK').data(params={'limit':52,'rows':52,'order':'desc'})
	data_set = pd.read_csv('server/python_data/NSE-' + curr['tradingsymbol']
	                 + '.csv').head(52)
	#-> data_set  = data.to_pandas()
	#logging.info(data_set.columns)
	####### data retrieval part end ###########

	# if test environment true then assign dummy values else assign real values 
	cl_col = data_set['Close']
	cl_52_max = cl_col.max() ## 1049.9 ## cl_col.max()
	cl_52_min = cl_col.min() ## 799.5 ## cl_col.min()
	
	if isTestEnv:
			cl_52_max =  1049.9 ## cl_col.max()
			cl_52_min =  799.5 ## cl_col.min()

	prev_buy_price = stk['prev_buy_price']

	#logging.info('close max :%s\nclose min :%s',cl_52_max,cl_52_min)

	#logging.info('close at 52 wk :%s',cl_52_max)
	ltp =  curr['close'] #curr['ltp'] or curr['close'] 

	logging.info('prev_buy_price :%s,stk[profit_margin]:%s',prev_buy_price,stk['profit_margin'])
	#signal = False
	if curr['transaction_type']=='BUY':
		if ltp <= cl_52_min * stk['buy_price_threshold']:
			#logging.info('%s:in buy signal true',curr['tradingsymbol'])
			signal = True
		else:
			#logging.info('%s:in buy signal false',curr['tradingsymbol'])
			signal = False
	if curr['transaction_type']=='SELL':
		if ltp >= prev_buy_price * stk['profit_margin']:
			#logging.info('%s:in sell signal true',curr['tradingsymbol'])
			signal = True
		else:
			#logging.info('%s:in sell signal false',curr['tradingsymbol'])
			signal = False

	logging.info("stock:%s, call:%s,  cl_52_min:%s, ltp:%s, trigger:%s , signal:%s, eval:%s",curr['tradingsymbol'],curr['transaction_type'],cl_52_min,ltp,cl_52_min * stk['buy_price_threshold'],signal,ltp <= (cl_52_min * stk['buy_price_threshold']))
	
	result = {}
	result['success'] = signal
	result['extras'] = {'ltp':ltp,'cl_52_min':cl_52_min,'trigger_price':cl_52_min * stk['buy_price_threshold']}
	return result

print json.dumps(check(in_data))

# result = {}
# result['success'] = False
# print json.dumps(result)



# dataset_data = quandl.Dataset('WIKI/AAPL').data(params={ 'start_date':'2001-01-01', 'end_date':'2010-01-01', 'collapse':'annual', 'transformation':'rdiff', 'rows':4 })