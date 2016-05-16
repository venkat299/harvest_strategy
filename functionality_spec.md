# harvest_strategy

###### #run()
- [x] should accept data (historical/live) i.e. dt
- [ ] should check for pending/placed order from db
- [ ] should query for more info from `harvest_data` 
- [ ] should apply logic on `dt` based on point 1 and point 2
- [x] should give `buy` or `sell` signal to `evaluator` after processing data

###### #register_order()
- [ ] should accept the order placed information from `evaluator`
- [ ] should save the order information to db under its own collection

###### #watchlist_update()
- [ ] should add stock to its watchlist
- [ ] should remove stock from its watchlist
- [ ] should update its db collection accordingly


###### #routine()
- [ ] should calculate `nrr` aka normalized_rate_of_return, `rate_of_return` for each stock in its watchlist

