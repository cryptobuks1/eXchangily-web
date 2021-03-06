import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-placeadv',
  templateUrl: './placeadv.component.html',
  styleUrls: ['./placeadv.component.css']
})
export class PlaceadvComponent implements OnInit {
  bidOrAsk: boolean;
  coinName: string;
  currency: string;
  advType: string;
  dataSource = [];
  currencies: string[] = [
    'USD',
    'CAD',
    'CNY'
  ];

  constructor() { }

  ngOnInit() {
    this.bidOrAsk = true;
    this.coinName = 'USDT';
    this.currency = 'USD';    
    this.advType = 'ongoing';
  }
  
  changeAdvType(type: string) {
    this.advType = type;
  }

  changeCoinName(bOrA: boolean, coin: string) {
    this.bidOrAsk = bOrA;
    this.coinName = coin;
    // console.log('this.coinName = ', this.coinName);
  }
}
