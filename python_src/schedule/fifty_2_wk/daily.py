#!/usr/bin/python
# -*- coding: utf-8 -*-

import sys
import json
import logging
import pandas as pd
import numpy as np
import math

#### local dependency

import helper_daily as helper

logging.basicConfig(level=logging.DEBUG, filename='logfile.log',
                    filemode='w', format='%(message)s')

opt = {}

# simple JSON echo script

lines = sys.stdin.readlines()
opt = json.loads(lines[len(lines) - 1])



final_result = {'strategy_id':'fifty_2_wk',"data":[]}

for stock in opt['data']:
	final_result['data'].append(helper.daily_run({"python_dir":opt['python_dir'],"tradingsymbol":stock}))

print json.dumps(final_result)
