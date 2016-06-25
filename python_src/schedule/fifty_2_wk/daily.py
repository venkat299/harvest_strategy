#!/usr/bin/python
# -*- coding: utf-8 -*-
import json
import sys
import logging
import uuid

# local dependency

import helper_daily as helper

logging.basicConfig(level=logging.DEBUG, filename='logfile.log',
                    filemode='w', format='%(message)s')

opt = {}

# simple JSON echo script

lines = sys.stdin.readlines()
opt = json.loads(lines[len(lines) - 1])



final_result = {'strategy_id':'fifty_2_wk','strategy_config':[],'evaluator_config':[]}

for stock in opt['data']:
	final_result['strategy_config'].append(helper.strategy_config({
			# "python_dir" : opt['python_dir'],
			"tradingsymbol" : stock
		}))

evaluator_config = helper.evaluator_config(final_result['strategy_config'])

final_result['evaluator_config'] = evaluator_config
logging.info('final_result')
logging.info(final_result)

json_file_name ='server/python_node_ipc/'+str(uuid.uuid4())+'.json'
json_file = open( json_file_name, 'w')
json.dump(final_result, json_file,encoding="utf-8")
#json.dumps(final_result,encoding="utf-8",json_file)

msg={'success':True,'file_path':json_file_name}
print json.dumps(msg)
