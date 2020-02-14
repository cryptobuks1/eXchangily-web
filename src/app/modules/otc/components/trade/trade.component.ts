import { Component, OnInit } from '@angular/core';

export interface PeriodicElement {
  Merchant: string;
  PaymentMethod: string[];
  Quantity: number;
  LimitsLow: number;
  LimitsHigh: number;
  Price: number;
  Currency: string;
  BidOrAsk: boolean;
  CoinName: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {
    Merchant: '闪闪电波波商行', 
    PaymentMethod: ['alipay'], 
    Quantity: 4010.457, 
    LimitsLow: 7000.0, 
    LimitsHigh: 35764.23, 
    Price: 7.11, 
    Currency: 'USD',
    BidOrAsk: true, 
    CoinName: 'USDT'
  },
  {
    Merchant: '奶粉大王', 
    PaymentMethod: ['alipay'], 
    Quantity: 4010.457, 
    LimitsLow: 7000.0, 
    LimitsHigh: 35764.23, 
    Price: 7.11, 
    Currency: 'USD',
    BidOrAsk: true, 
    CoinName: 'USDT'
  },
  {
    Merchant: '全全天在线~秒放币~秒放款', 
    PaymentMethod: ['alipay', 'bank'], 
    Quantity: 4010.457, 
    LimitsLow: 7000.0, 
    LimitsHigh: 35764.23, 
    Price: 7.11, 
    Currency: 'USD',
    BidOrAsk: true, 
    CoinName: 'USDT'
  },
  {
    Merchant: '诚信胖虎', 
    PaymentMethod: ['alipay'], 
    Quantity: 4010.457, 
    LimitsLow: 7000.0, 
    LimitsHigh: 35764.23, 
    Price: 7.11, 
    Currency: 'USD',
    BidOrAsk: true, 
    CoinName: 'USDT'
  },
  {
    Merchant: '光速~小宇哥', 
    PaymentMethod: ['alipay', 'bank'], 
    Quantity: 4010.457, 
    LimitsLow: 7000.0, 
    LimitsHigh: 35764.23, 
    Price: 7.11, 
    Currency: 'USD',
    BidOrAsk: false, 
    CoinName: 'USDT'
  },
];


@Component({
  selector: 'app-trade',
  templateUrl: './trade.component.html',
  styleUrls: ['./trade.component.css']
})
export class TradeComponent implements OnInit {
  bidOrAsk: boolean;
  coinName: string;
  currency: string;
  currencies: string[] = [
    'USD',
    'CAD',
    'CNY'
  ];

  dataSource = ELEMENT_DATA;

  constructor() { }

  ngOnInit() {
    this.bidOrAsk = true;
    this.coinName = 'USDT';
    this.currency = 'USD';
  }

  changeCoinName(bOrA: boolean, coin: string) {
    this.bidOrAsk = bOrA;
    this.coinName = coin;
  }
}