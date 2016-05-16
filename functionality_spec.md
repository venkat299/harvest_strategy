# harvest_strategy

* every strategy will analyse the data and recommend `BUY` or `SELL` signals for `stock_x`
* quantity and order type will be optional and depends upon strategy implementation
* every strategy should emit `BUY` and  `SELL` signal  for a stock, in whatever order, also, simutanously updating the status of stock to   its collection to (`open`,`closed`).
* every strategy call for a stock should follow  from `open` to `close` cycle, until it can make an another call for the same stock, unless explicity allowed by the strategy to make an exception


###### #run()
- [x] should accept data (historical/live) i.e. dt
- [ ] should check for pending/placed order from db (check `register_order()`)
- [ ] should query for more info from `harvest_data` 
- [ ] should apply logic on `dt` based on point 1 and point 2
- [x] should give `buy` or `sell` signal to `evaluator` after processing data

###### #register_order()
- [ ] should accept the order placed information from `evaluator` and change the status to `open` || `close`.(order status is sent only when the status is changed to `COMPLETE`)
- [ ] should save the order information to db under its own collection

###### #watchlist_update()
- [ ] should add stock to its own watchlist collection
- [ ] should remove stock from its watchlist
- [ ] should update its db collection accordingly


###### #routine()
- [ ] should calculate `nrr` aka normalized_rate_of_return, `rate_of_return` for each stock in its watchlist. This use case should be implemented irrespective of the strategies

