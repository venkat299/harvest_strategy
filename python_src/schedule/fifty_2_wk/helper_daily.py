#!/usr/bin/python
# -*- coding: utf-8 -*-

import sys
import json
import logging
import pandas as pd
import numpy as np
import math
from scipy import stats


def strategy_config(opt):
	 # simple JSON echo script
	# lines = sys.stdin.readlines()
	# logging.info('input lines:%s data:%s',len(lines),lines)
	# opt = json.loads(lines[len(lines)-1])
	logging.info(opt)
	# logging.info(opt['python_dir'])
	dt = pd.read_csv('server/python_data/NSE-' + opt['tradingsymbol']
	                 + '.csv')
	dt_length = len(dt)
	logging.info(dt.columns)
	logging.info('len(dt):%s', len(dt))
	logging.info(dt.head(5))
	logging.info(dt.tail(5))
	logging.info('Processing Stock:%s',opt['tradingsymbol'])
	 # converting to array
	dt_arr = dt.as_matrix()[::-1, :]
	margin = [1.025,1.05,1.075,1.1,1.125,1.15,1.20,1.20,1.25,1.30,1.35]
	
	res_ls=[]
	ror_ls=[]
	for x in margin:
		run_result=find_max(dt_arr,x)
		if run_result[0]:
			logging.info('%s:::margin:%s==>%s',opt['tradingsymbol'],x,run_result[1])
			res_ls.append(run_result[1])
			ror_ls.append(run_result[1]['ror'])
		else:
			logging.info('%s:::margin:%s==>no transaction',opt['tradingsymbol'],x,)
	result={}
	if len(ror_ls)>0:
		result = res_ls[ror_ls.index(max(ror_ls))]
	result['strategy_id'] = 'fifty_2_wk'
	result['tradingsymbol'] = opt['tradingsymbol']
	return result


def find_max(dt_arr,margin):
	close_t0 = dt_arr[:, 5]
	max_52 = close_t0[0:52].max()
	min_52 = close_t0[0:52].min()
	 # close_t1 = dt_arr[0:5,5]
	logging.info(close_t0[0:5])
	logging.info(max_52)
	logging.info(min_52)
	fixed_limit = 10000
	variable_limit = 10000
	fixed_limit_profit = 0
	variable_limit_profit = 0
	fixed_returns = []
	n = 0
	open = False
	last_buy_price = 0
	profit = 0
	order_cycles = 0
	op_cl_period = 0
	op_cl_periods = []
	fixed_qty = 0
	variable_qty = 0
	for curr in np.nditer(close_t0[52:], ['refs_ok'], order='C'):
	    temp_min = close_t0[n:n + 52].min()
	    temp_max = close_t0[n:n + 52].max()
	    temp_min_margin = temp_min * 1.25
	    if curr <= temp_min_margin:
	        open = True
	        last_buy_price = curr
	        op_cl_period = n
	        fixed_qty = math.ceil(fixed_limit / curr)
	        variable_qty = math.ceil(variable_limit / curr)
	    elif curr > last_buy_price * margin and last_buy_price > 0:
	        open = False
	        fixed_limit_profit = fixed_limit_profit + (last_buy_price
	                - curr) * -1 * fixed_qty
	        variable_limit_profit = variable_limit_profit \
	            + (last_buy_price - curr) * -1 * variable_qty
	        variable_limit = variable_limit + variable_limit_profit
	        fixed_returns.append(round((last_buy_price - curr) * -1
	                             * fixed_qty, 2))
	        order_cycles = order_cycles + 1
	        op_cl_periods.append(n - op_cl_period)
	         # reset values
	        last_buy_price = 0
	        op_cl_period = 0
	        fixed_qty = 0
	        variable_qty = 0
	     # logging.info('n:%s curr:%s max:%s min:%s margin:%s open:%s fixed_profit:%s varied_profit:%s',n,curr,temp_max,temp_min,temp_min_margin,open,fixed_limit_profit,variable_limit_profit),
	    n = n + 1
	    
	logging.info(n)
	logging.info('order_cycles:%s', order_cycles)
	logging.info(op_cl_periods)
	if order_cycles<=1:
		return (False,{})
	df_std = pd.DataFrame(fixed_returns)
	returns_std = df_std.std()  # /df_std.mean()
	returns_mean = df_std.mean()

	res = {}
	res['returns_mean'] =  round(returns_mean)
	res['margin'] =  round(margin,4)
	res['returns_std'] =round(returns_std, 4)
	res['ror'] = round(variable_limit_profit / fixed_limit, 4)
	res['extra_info'] = {'cycle_periods': op_cl_periods,
	                      'fixed_returns': fixed_returns}
	return (True,res)

def evaluator_config(ror_dt):
	stk_ls = []
	ror_ls = []
	margin_ls = []
	buy_price_threshold = 1.25
	stock_ceil = 1
	dump = {}
	for x in ror_dt:
		ror_ls.append(x['ror'])
		stk_ls.append(x['tradingsymbol'])
		margin_ls.append(x['margin'])
	# dt_std = pd.DataFrame(ror_ls)
	#rank = stats.rankdata(ror_ls, "average")/len(ror_ls)
	ror_ls = np.log10(ror_ls)
	norm = [float(i)/sum(ror_ls) for i in ror_ls]
	# dump.append(stk_ls)
	# dump.append(ror_ls)
	# dump['rank']=rank.tolist()
	# "buy_price_threshold": 1.25,
	nrr=[]
	nrr_ls = norm #rank.tolist()
	y=0
	for x in nrr_ls:
		nrr.append({'strategy_id':'fifty_2_wk','tradingsymbol':stk_ls[y],'nrr':x,'profit_margin':margin_ls[y],"buy_price_threshold": buy_price_threshold,'stock_ceil':stock_ceil})
		y=y+1
	return nrr


