import sys, json, logging, quandl
import pandas as pd
import urllib

logging.basicConfig(level=logging.DEBUG, filename="logfile.log",filemode="w",format="%(message)s")


api_key = '1CzVT1zp5yzCQjQNq8yR'
quandl.ApiConfig.api_key = api_key

# https://www.quandl.com/api/v3/datasets/NSE/YESBANK.csv?api_key=1CzVT1zp5yzCQjQNq8yR&limit=1095

#stocks = ["ADANIPORTS","AMBUJACEM","ASIANPAINT","AUROPHARMA","AXISBANK","BAJAJ-AUTO","BANKBARODA","BHEL","BPCL","BHARTIARTL","INFRATEL","BOSCHLTD","CIPLA","COALINDIA","DRREDDY","EICHERMOT","GAIL","GRASIM","HCLTECH","HDFCBANK","HEROMOTOCO","HINDALCO","HINDUNILVR","HDFC","ITC","ICICIBANK","IDEA","INDUSINDBK","INFY","KOTAKBANK","LT","LUPIN","M&M","MARUTI","NTPC","ONGC","POWERGRID","RELIANCE","SBIN","SUNPHARMA","TCS","TATAMTRDVR","TATAMOTORS","TATAPOWER","TATASTEEL","TECHM","ULTRACEMCO","WIPRO","YESBANK","ZEEL","AARTIDRUGS","ASAHISONG","BBTC","ENGINERSIN","EXCELINDUS","GMBREW","IBVENTURES","JBMA","KABRAEXTRU","MANALIPETC","MARUTI","MIRZAINT","POLYMED","SHILPI","STER","STOREONE","TATAMOTORS","WELSPUNIND","WINDMACHIN","XCHANGING","ZICOM"]

stocks = ["ADANIPORTS","AMBUJACEM"]


opt={}

# simple JSON echo script
lines = sys.stdin.readlines()
#logging.info('input lines:%s data:%s',len(lines),lines)
opt = json.loads(lines[len(lines)-1])

logging.info(opt)

stock_list=[]

if 'stock_list' in opt:
  stock_list = opt['stock_list']
else:
 stock_list = stocks

stock_set = set(stock_list)

for i in stock_set:
	url = 'https://www.quandl.com/api/v3/datasets/NSE/'+i+'.csv?api_key='+api_key+'&limit=1095'
	dest = 'server/python_data/NSE-'+i+'.csv'
	urllib.urlretrieve (url, dest)
	logging.info('>downloaded  3 year eod  for %s',i)

result = {}
result['success'] = True

logging.info(result)
print json.dumps(result)