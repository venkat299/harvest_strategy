#!/usr/bin/python
# -*- coding: utf-8 -*-
import sys
import json
import logging
import pandas as pd
import numpy as np
import math


def daily_run(opt):

    # simple JSON echo script
    # lines = sys.stdin.readlines()
    # logging.info('input lines:%s data:%s',len(lines),lines)
    # opt = json.loads(lines[len(lines)-1])

    logging.info(opt)
    logging.info(opt['python_dir'])
    dt = pd.read_csv('server/python_data/NSE-' + opt['tradingsymbol']
                     + '.csv')

    dt_length = len(dt)

    logging.info(dt.columns)
    logging.info('len(dt):%s', len(dt))
    logging.info(dt.head(5))
    logging.info(dt.tail(5))

    # converting to array

    dt_arr = dt.as_matrix()[::-1, :]

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
        elif curr > last_buy_price * 1.10 and last_buy_price > 0:
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

    df_std = pd.DataFrame(fixed_returns)
    returns_std = df_std.std()  # /df_std.mean()
    returns_mean = df_std.mean()

    # def do_full_simulation ():

    # run simulation
    # ....- select a random date (index/total length )
    # ....- check if stock price can be open
    # ....- open or wait
    # ....- check if can be closed
    # ....- close
    # ....- if closed calculate average return % and average time for openning and closing
    # ....- check average return for total dataset

    dummy_result = {}
    dummy_result['ror'] = round(variable_limit_profit / fixed_limit, 4)
    dummy_result['returns_std'] = round(returns_std, 4)
    dummy_result['returns_mean'] = round(returns_mean)
    dummy_result['cycle_periods'] = op_cl_periods
    dummy_result['fixed_returns'] = fixed_returns
    dummy_result['strategy_id'] = 'fifty_2_wk'
    dummy_result['tradingsymbol'] = opt['tradingsymbol']

    return dummy_result
