# harvest_strategy

* every strategy will analyse the data and recommend `BUY` or `SELL` signals for `stock_x`
* quantity, order type & other order details will be optional and depends upon strategy implementation
* every strategy should emit `BUY` and  `SELL` signal  for a stock, in whatever order, also, simutanously updating the status of stock to   its collection to (`open`,`closed`).
* every strategy call for a stock should follow  from (`pending_open` -> `open` -> `pending_close` -> `close`) cycle, until it can make an another call for the same stock, unless explicity allowed by the strategy to make an exception


###### #run()
- [x] should accept data (historical/live) i.e. dt
- [x] should check for pending/placed order from db (check `register_order()`)
- [x] should query for more info from `harvest_data` 
- [x] should apply logic on `dt` based on point 1 and point 2
- [x] should give `buy` or `sell` signal to `evaluator` after processing data

###### #update_order()
- [x] should accept the order placed information from `evaluator` and change the status from `PENDING_OPEN` || `PENDING_CLOSE` to `OPEN` || `CLOSE`.(order status is sent only when the status is changed to `COMPLETE`)
- [x] should save the order information to db under its own collection
- [x] should also update  `stock_update` collection's field `last_buy_price || last_sell_price`
###### #watchlist_update()
- [x] should add stock to its own watchlist collection
- [x] should remove stock from its watchlist(make status inactive)
- `watchlist` entity struct
	* strategy_id:string
	* tradingsymbol:string
	* status:['ACTIVE','INACTIVE']
	* routine_run_dt:unix_time



###### #routine()
- [ ] should calculate `nrr` aka normalized_rate_of_return, `rate_of_return` for each stock in its watchlist. This use case should be implemented irrespective of the strategies

