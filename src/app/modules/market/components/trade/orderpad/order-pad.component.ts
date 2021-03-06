import { Component, Output, TemplateRef, Input, OnInit, EventEmitter, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

//import { Order } from '../../../models/order';
import { Order, OrderBookItem, OrderItem, TradeItem } from '../../../../../interfaces/kanban.interface';
import { TxRecord } from '../../../models/order-book';
import { OrderService } from '../../../services/order.service';
import { Web3Service } from '../../../../../services/web3.service';
import { KanbanService } from '../../../../../services/kanban.service';
import { TradeService } from '../../../services/trade.service';

import { UtilService } from '../../../../../services/util.service';
import { WalletService } from '../../../../../services/wallet.service';
import { CoinService } from '../../../../../services/coin.service';
import { Wallet } from '../../../../../models/wallet';
import * as secureRandom from 'secure-random';
import { FormBuilder } from '@angular/forms';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import {MatSnackBar} from '@angular/material/snack-bar';
import {TransactionResp} from '../../../../../interfaces/kanban.interface';
import { WebSocketSubject } from 'rxjs/observable/dom/WebSocketSubject';
import { ActivatedRoute } from '@angular/router';
import { AlertService } from '../../../../../services/alert.service';
import { StorageService } from '../../../../../services/storage.service';
import { environment } from '../../../../../../environments/environment';
import { TimerService } from '../../../../../services/timer.service';
import BigNumber from 'bignumber.js/bignumber';
declare let window: any;
@Component({
    selector: 'app-order-pad',
    templateUrl: './order-pad.component.html',
    styleUrls: ['./order-pad.component.css']
})

export class OrderPadComponent implements OnInit, OnDestroy {

    wallet: Wallet;
    private _mytokens: any;

    screenheight = screen.height;
    select = 1;
    orderType = 1;
    myorder: Order;
    bidOrAsk: boolean;
    sells: OrderItem[] = [];
    buys: OrderItem[] = [];
    aArray = [];
    bArray = [];
    txOrders: TxRecord[] = [];
    currentPrice = 0;
    currentQuantity = 0;
    change24h = 0;
    totalBuy = 0.0;
    totalSell = 0.0;
    buyPrice = 0;
    buyQty = 0;
    sellPrice = 0;
    sellQty = 0;
    price = 0;
    qty = 0;
    pin: string;
    modalRef: BsModalRef;
    baseCoinAvail: number;
    targetCoinAvail: number;
    refreshTokenDone: boolean;
    timer: any;
    oldNonce: number;
    socket: WebSocketSubject<OrderBookItem>;
    tradesSocket: WebSocketSubject<TradeItem>;
    sub: any;
    baseCoin: number;
    targetCoin: number;
    buyGasPrice: number;
    buyGasLimit: number;
    sellGasPrice: number;
    sellGasLimit: number;
    gasPrice: number;
    gasLimit: number;
    // interval;

    constructor(private storageServ: StorageService, private web3Serv: Web3Service, private coinService: CoinService,
      private kanbanService: KanbanService, public utilService: UtilService, private walletService: WalletService, 
      private fb: FormBuilder, private modalService: BsModalService, private tradeService: TradeService, 
      private route: ActivatedRoute, private alertServ: AlertService, private timerServ: TimerService) {
        this.refreshTokenDone = true; 
    }

    ngOnDestroy() {
      if (this.socket) {
        this.socket.unsubscribe();
      }
      if (this.tradesSocket) {
        this.tradesSocket.unsubscribe();
      }      
      this.sub.unsubscribe();
      clearInterval(this.timer);
    }

    bigmul(num1, num2) {
      const x = new BigNumber(num1.toString());
      const result = x.times(num2);
      return result;
    }

    bigdiv(num1, num2) {
      const x = new BigNumber(num1.toString());
      const result = x.dividedBy(num2);
      return result;
    }

    showBuysAmount(buys: any, index: number) {
      if (!buys) {
        return 0;
      }
      
      let amountBig = new BigNumber(0);
      for (let i = 0; i <= index; i++) {
        const buy = buys[i];
        amountBig = amountBig.plus(this.utilService.showAmountArr(buy.amountArr));
      }

      return amountBig.toFixed();
    }

    showSellsAmount(sells: any, index: number) {
      if (!sells) {
        return 0;
      }
      
      let amountBig = new BigNumber(0);
      for (let i = sells.length - 1; i >= index; i--) {
        const sell = sells[i];
        amountBig = amountBig.plus(this.utilService.showAmountArr(sell.amountArr));
      }

      return amountBig.toFixed();
    }

    syncOrders ( newOrderArr, oldOrderArr, bidOrAsk: boolean) {
      // console.log('begin newOrderArr=', newOrderArr);
      // console.log('begin oldOrderArr=', oldOrderArr);
      let i = 0;
      let j = 0;
      let k = 0;
      for (j = 0; j < oldOrderArr.length; j++) {
        const oldOrderItem = oldOrderArr[j];
        for ( i = 0; i < oldOrderItem.checkedArr.length; i++) {
          oldOrderItem.checkedArr[i] = false;
        }
      }     
      for (i = (bidOrAsk ? 0 : (newOrderArr.length - 1)); bidOrAsk ? (i < newOrderArr.length) : (i >= 0) ; bidOrAsk ? (i++) : (i--)) {

        const newOrderItem = newOrderArr[i];

        const newPrice = Number(newOrderItem.price);
        const newAmount = Number(newOrderItem.orderQuantity);
        const newOrderHash = newOrderItem.orderHash; 

        let newOrderHashExisted = false;
        for (j = 0; j < oldOrderArr.length; j++) {
          const oldOrderItem = oldOrderArr[j];
          const oldOrderHashArr = oldOrderItem.orderHashArr;
          const oldPrice = oldOrderItem.price;

          /*
          if (oldOrderHashArr.includes(newOrderHash)) {
            oldOrderItem.checked = true;
            newOrderHashExisted = true;
            break;
          }
          */

          for (k = 0; k < oldOrderHashArr.length; k++) {
            if (oldOrderHashArr[k] === newOrderHash) {
              oldOrderItem.checkedArr[k] = false;
              oldOrderItem.amountArr[k] = newAmount;
              newOrderHashExisted = true;
              break;
            }
          }


          if (oldPrice === newPrice) {
            oldOrderItem.checkedArr.push(true);
            oldOrderItem.amountArr.push(newAmount);
            oldOrderItem.percentage = newAmount * 100 / oldOrderItem.amount;
            oldOrderHashArr.push(newOrderHash);
            newOrderHashExisted = true;
            break;
          }

          if (oldPrice < newPrice) {
            break;
          }
        }

        // console.log('newOrderHashExisted=', newOrderHashExisted);
        if (newOrderHashExisted) {
          continue;
        }

        const item = {
          amountArr: [newAmount],
          price: newPrice,
          checkedArr: [true],
          percentage: 100,
          orderHashArr: [newOrderHash]          
        };
        
        oldOrderArr.splice(j, 0, item);
      }

      
      for (j = 0; j < oldOrderArr.length; j++) {
        const oldOrderItem = oldOrderArr[j];
        for (k = 0; k < oldOrderItem.checkedArr.length; k++) {
          if (!oldOrderItem.checkedArr[k]) {
            oldOrderItem.checkedArr.splice(k, 1);
            oldOrderItem.orderHashArr.splice(k, 1);
            oldOrderItem.amountArr.splice(k, 1);
            k --;
          }
        }
        if (oldOrderItem.checkedArr.length === 0 || oldOrderItem.amountArr.length === 0) {
          oldOrderArr.splice(j, 1);
          j --;
        }
      } 
      
      if (bidOrAsk) {
        while (oldOrderArr.length > 8) {
          oldOrderArr.pop();
        }
      } else {
        while (oldOrderArr.length > 8) {
          oldOrderArr.shift();
        }        
      }

      // console.log('final oldOrderArr=', oldOrderArr);
    }    
    /*
    addToOrderArray(orderArray, item, trimTag) {
      let i = 0;
      const maxOrdersCount = 10;


      
        if (trimTag === 'top') {

          for (i = 0; i < orderArray.length; i++) {
            const orderItem = orderArray[i];
            if (orderItem.orderHash.includes(item.orderHash[0])) {
              return;
            }            
            if (orderItem.price === item.price) {
              orderItem.amount += item.amount;
              orderItem.orderHash.push(item.orderHash[0]);
              return;
            } else
            if (orderItem.price < item.price) {
              break;
            }
          }
          orderArray.splice(i, 0, item);
          if (orderArray.length > maxOrdersCount) {
          orderArray.shift();
          }
        } else 
        if (trimTag === 'bottom') {

          
          for (i = 0; i < orderArray.length; i++) {
            const orderItem = orderArray[i];
            if (orderItem.orderHash.includes(item.orderHash[0])) {
              return;
            }            
            if (orderItem.price === item.price) {
              orderItem.amount += item.amount;
              orderItem.orderHash.push(item.orderHash[0]);
              return;
            } else            
            if (orderItem.price < item.price) {
              break;
            }
          }
          orderArray.splice(i, 0, item);
          if (orderArray.length > maxOrdersCount) {
          orderArray.pop();  
          }        
        }

    }

    addTo(orderArr, bidOrAsk: boolean) {
      orderArr = orderArr.slice(0, 10);
      if (bidOrAsk) {
        // this.buys = [];
      } else {
        // this.sells = [];
        orderArr = orderArr.reverse();
      }
      for (let i = 0 ; i < orderArr.length; i++) {
        const orderItem = orderArr[i];

        // console.log('orderItem=', orderItem);
        const price = Number(orderItem.price);
        const amount = Number(orderItem.orderQuantity);
        const orderHash = orderItem.orderHash;
        const item = {
          amount: amount,
          price: price,
          orderHash: [orderHash]          
        }; 
        if (bidOrAsk) {
          this.addToOrderArray(this.buys, item, 'bottom');
        } else {
          this.addToOrderArray(this.sells, item, 'top');
        }        
      } 
      
      if (bidOrAsk) {
        this.checkIfDeleted(this.buys, orderArr);
      } else {
        this.checkIfDeleted(this.sells, orderArr);
      }
    }
    */
    checkIfDeleted(existedArray, incomingArray) {
      for (let i = 0; i < existedArray.length; i ++) {
        const existedItem = existedArray[i];
        for (let j = 0; j < incomingArray.length; j++) {
          const incomingItem = incomingArray[j];
          if (existedItem.orderHash.includes(incomingItem.orderHash)) {
            return;
          }
        }
        existedArray.splice(i, 1);
        i --;
      }
    }

    setBuyQtyPercent(percent: number) {
      this.buyQty = Number(this.utilService.showAmount(this.bigdiv(this.baseCoinAvail, this.buyPrice))) * percent;
    }

    setSellQtyPercent(percent: number) {
      this.sellQty = Number(this.utilService.showAmount(this.targetCoinAvail)) * percent;
    }    
    
    setPrice(price: number) {
      const realPrice = this.utilService.showAmount(price);
      this.buyPrice = Number(realPrice);
      this.sellPrice = Number(realPrice);
    }

    refreshOrders() {
      this.sells = [];
      this.buys = [];
      this.txOrders = [];
      this.currentPrice = 0;
      this.currentQuantity = 0;

      const baseCoinName = this.coinService.getCoinNameByTypeId(this.baseCoin);
      const targetCoinName = this.coinService.getCoinNameByTypeId(this.targetCoin);      
      const pair = targetCoinName + baseCoinName;
      // console.log('pair = ' + pair);

      if (this.socket) {
        this.socket.unsubscribe();
      }
      this.socket = new WebSocketSubject(environment.websockets.orders + '@' + pair);
      this.socket.subscribe(
        (orders: any) => {
          this.syncOrders(orders.sell, this.sells, false);
          this.syncOrders(orders.buy, this.buys, true);
          // this.addTo(orders.sell, false);
          // this.addTo(orders.buy, true);
        },
        (err) => {
          console.log('err:', err);
        },
        () => {
          console.log('Completed');
        }
      );

      if (this.tradesSocket) {
        this.tradesSocket.unsubscribe();
      }      
      this.tradesSocket = new WebSocketSubject(environment.websockets.trades + '@' + pair);
      this.tradesSocket.subscribe(
        (trades: any) => {
          trades = trades.reverse();
          // this.txOrders = [];
          // console.log('trades=', trades);
          for (let i = 0; i < trades.length; i++) {
            
            const item = trades[i];
            const tradeTime = item.time * 1000;

            let tradeExisted = false;

            const price = Number(item.price);
            const quantity = Number(item.amount);
            const buyerMarketMaker = item.bidOrAsk;
            const orderHash1 = item.orderHash1;
            const orderHash2 = item.orderHash2;
            if (i === trades.length - 1) {
              this.currentPrice = price;
              this.currentQuantity = quantity;
            }
            // console.log('tradeTime=', tradeTime);
            for (let j = 0; j < this.txOrders.length; j++) {
              // console.log('this.txOrders[j].time=', this.txOrders[j].time);

              const orderH1 = this.txOrders[j].orderHash1;
              const orderH2 = this.txOrders[j].orderHash2;
              if ((orderH1 === orderHash1) && (orderH2 === orderHash2)) {
                tradeExisted = true;
                // console.log('tradeExisted1=', tradeExisted);
                break;
              }
              // console.log('tradeExisted2=', tradeExisted);
            }
            // console.log();
            
            if (tradeExisted) {
              continue;
            }            
            const txItem = {
                price: price,
                quantity: quantity,
                m: buyerMarketMaker,
                time: tradeTime,
                orderHash1: orderHash1,
                orderHash2: orderHash2
            };

            if (this.txOrders.length > 22) {
              // break;
              this.txOrders.pop();
            }
            this.txOrders.unshift(txItem);
          }

        },
        (err) => {
          console.log('err:', err);
        },
        () => {
          console.log('Completed');
        }
      );

    }

    /*
    onRefreshToken(tokens) {
      console.log('onRefreshToken in orderPad');
      if (!this.utilService.arraysEqual(tokens, this.mytokens)) {
        this.mytokens = tokens;
        this.refreshTokenDone = true;
      }
      
    }
    */
   setMytokens(mytokens: any) {
     this._mytokens = mytokens;
     this.refreshCoinAvail();

      
   }
   
   refreshCoinAvail() {
     let baseCoinAvailExisted = false;
     let targetCoinAvailExisted = false;
    if (this.baseCoin && this.targetCoin) {
      if (this._mytokens && this._mytokens.length > 0) {
        for (let i = 0; i < this._mytokens.length; i++) {
          if (this._mytokens[i].coinType === this.baseCoin.toString()) {
            baseCoinAvailExisted = true;
            this.baseCoinAvail = Number(this._mytokens[i].unlockedAmount);
          }
          if (this._mytokens[i].coinType === this.targetCoin.toString()) {
            targetCoinAvailExisted = true;
            this.targetCoinAvail = Number(this._mytokens[i].unlockedAmount);
          }  
        }
      }  
     } 
     if (!baseCoinAvailExisted) {
      this.baseCoinAvail = 0;
     }
     if (!targetCoinAvailExisted) {
      this.targetCoinAvail = 0;
     }
   }
   buyable() {
    if ((this.buyPrice <= 0) || (this.buyQty <= 0)) {
      return false;
    }     
     if (!this.baseCoinAvail) {
       return false;
     }
     const avail = Number(this.utilService.showAmount(this.baseCoinAvail.toString()));
     const consume = this.buyPrice * this.buyQty;
     if (avail >= consume) {
       return true;
     }
     return false;
   }

   sellable() {
    if ((this.sellPrice <= 0) || (this.sellQty <= 0)) {
      return false;
    }
    if (!this.targetCoinAvail) {
      return false;
    }     
    const avail = Number(this.utilService.showAmount(this.targetCoinAvail.toString()));
    const consume = this.sellQty;
    if (avail >= consume) {
      return true;
    }
    return false;     
   }

   getMytokens(): any { return this._mytokens; }

   async ngOnInit() {
     // console.log('ngOnInit for order Pad');
      this.oldNonce = -1;
      this.buyGasLimit = environment.chains.KANBAN.gasLimit;
      this.buyGasPrice = environment.chains.KANBAN.gasPrice;
      this.sellGasLimit = environment.chains.KANBAN.gasLimit;
      this.sellGasPrice = environment.chains.KANBAN.gasPrice;
      this.wallet = await this.walletService.getCurrentWallet();

      if (this.wallet) {
          const address = this.wallet.excoin.receiveAdds[0].address;
          this.timerServ.checkTokens(address, 1);
      }


      this.timerServ.tokens.subscribe(
          (tokens: any) => { 
              this.setMytokens(tokens);
          }            
      ); 

      this.sub = this.route.params.subscribe(params => {
        const pair = params['pair']; // (+) converts string 'id' to a number
        // console.log('pair for refresh pageeee=' + pair);
        const pairArray = pair.split('_');
        this.baseCoin = this.coinService.getCoinTypeIdByName(pairArray[1]);
        this.targetCoin = this.coinService.getCoinTypeIdByName(pairArray[0]);
        this.refreshOrders();
        this.refreshCoinAvail();     
        // this.loadChart(pairArray[0], pairArray[1]);
        // In a real app: dispatch action to load the details here.
     });      

    }

// This method provides a unique value to track orders with.
    generateOrderHash (bidOrAsk, orderType, baseCoin, targetCoin, amount, price, timeBeforeExpiration) {
        const randomString = secureRandom.randomUint8Array(32).map(String).join('');
        const concatString = [bidOrAsk, orderType, baseCoin, targetCoin, amount, price, timeBeforeExpiration, randomString].join('');
        return this.web3Serv.sha3(concatString);
    }

    selectOrder(ord: number) {
        this.select = ord;
    }

    confirmPin() {
      const pwdHashStr = this.utilService.SHA256(this.pin).toString();
      if (this.wallet.pwdHash !== pwdHashStr) {
        this.alertServ.openSnackBar('Your password is invalid', 'Ok');
        return;
      }
      sessionStorage.setItem('pin', this.pin);
      const thirty_minutes_from_now = new Date().getTime() + 600000 * 3;
      sessionStorage.setItem('pin_expired_at', thirty_minutes_from_now.toString());
      this.buyOrSell();
      this.modalRef.hide();
    }

    buy(pinModal: TemplateRef<any>) {
      if (!this.wallet) {
        this.alertServ.openSnackBar('please create wallet before placing order', 'ok');
        return;
      }
      this.bidOrAsk = true;
      this.pin = sessionStorage.getItem('pin');
      const pin_expired_at = sessionStorage.getItem('pin_expired_at');
      let pin_expired = true;
      if (pin_expired_at) {
        const currentTime = new Date().getTime();
        const expired_time = parseInt(pin_expired_at);
        if (currentTime < expired_time) {
          pin_expired = false;
        }
      }
      this.price = this.buyPrice;
      this.qty = this.buyQty;      
      this.gasLimit = Number(this.buyGasLimit);
      this.gasPrice = Number(this.buyGasPrice);
      if (this.pin && !pin_expired) {
        this.buyOrSell();
      } else {
        this.openModal(pinModal);
      }
      
    }

    sell(pinModal: TemplateRef<any>) {
      if (!this.wallet) {
        this.alertServ.openSnackBar('please create wallet before placing order', 'ok');
        return;
      }      
      if (this.targetCoinAvail < this.sellQty) {
        this.alertServ.openSnackBar('You have not enough ' + this.coinService.getCoinNameByTypeId(this.targetCoin), 'ok');
        return;        
      }
      this.bidOrAsk = false;
      this.pin = sessionStorage.getItem('pin');
      this.price = this.sellPrice;
      this.qty = this.sellQty;
      this.gasLimit = Number(this.sellGasLimit);
      this.gasPrice = Number(this.sellGasPrice);            
      if (this.pin) {    
        this.buyOrSell();
      } else {
        this.openModal(pinModal);
      }
      
    }

    openModal(template: TemplateRef<any>) {
      this.modalRef = this.modalService.show(template, { class: 'second' });
    }

    async txHexforPlaceOrder
    (pin: string, wallet: any, bidOrAsk: boolean, baseCoin: number, targetCoin: number, price: number, qty: number) {
      console.log('baseCoin=', baseCoin);
      console.log('targetCoin=', targetCoin);
      const seed = this.utilService.aesDecryptSeed(wallet.encryptedSeed, pin);
      const keyPairsKanban = this.coinService.getKeyPairs(wallet.excoin, seed, 0, 0);
      const orderType = 1;
      if (!bidOrAsk) {
        const tmp = baseCoin;
        baseCoin = targetCoin;
        targetCoin = tmp;
      }

      const timeBeforeExpiration = 423434342432;

      const address = await this.kanbanService.getExchangeAddress();
      const orderHash = this.generateOrderHash(bidOrAsk, orderType, baseCoin
          , targetCoin, qty, price, timeBeforeExpiration);
      
      const qtyString = new BigNumber(qty).multipliedBy(new BigNumber(1e18)).toFixed();
      const priceString = new BigNumber(price).multipliedBy(new BigNumber(1e18)).toFixed();

      const abiHex = this.web3Serv.getCreateOrderFuncABI([bidOrAsk,  
          orderType, baseCoin, targetCoin, qtyString, priceString, 
          timeBeforeExpiration, false,  orderHash]);
      const nonce = await this.kanbanService.getTransactionCount(keyPairsKanban.address);

     if ((this.gasPrice <= 0) || (this.gasLimit <= 0)) {
       return;
     }
     const options = {
      gasPrice: this.gasPrice,
      gasLimit: this.gasLimit
     };

      const txHex = await this.web3Serv.signAbiHexWithPrivateKey(abiHex, keyPairsKanban, address, nonce, 0, options); 
      return {
        txHex: txHex,
        orderHash: orderHash
      };
    }

    async buyOrSell() {
        this.refreshTokenDone = false;
        const {txHex, orderHash} = await this.txHexforPlaceOrder(
          this.pin, this.wallet, this.bidOrAsk, this.baseCoin, this.targetCoin, this.price, this.qty
        );

        this.kanbanService.sendRawSignedTransaction(txHex).subscribe((resp: TransactionResp) => {

        if (resp && resp.transactionHash) {
                this.alertServ.openSnackBar('Your order was placed successfully.', 'Ok');

               const address = this.wallet.excoin.receiveAdds[0].address;
               this.timerServ.checkOrderStatus(address, 30);
               this.timerServ.checkTokens(address, 30);

                if (this.bidOrAsk) {
                  this.buyPrice = 0;
                  this.buyQty = 0;
                } else {
                  this.sellPrice = 0;
                  this.sellQty = 0;                  
                }
       
                
              } else {
                this.alertServ.openSnackBar('Something wrong while placing your order.', 'Ok');
              }
        },
        error => {
          this.alertServ.openSnackBar(error.error, 'Ok');
        }
        );        
    }

  
}
