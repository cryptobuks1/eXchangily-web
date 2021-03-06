import { Injectable } from '@angular/core';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { TransactionItem } from '../models/transaction-item';
import {Subject} from 'rxjs/Subject';   
import {Transaction} from '../interfaces/kanban.interface';

@Injectable()
export class StorageService {
    constructor(private localSt: LocalStorage) {

    }


    addTradeTransaction(tx: Transaction) {
        this.localSt.getItem('mytransactions').subscribe((transactions: Transaction[]) => {
            if (!transactions) {
                transactions = [];
            }
            transactions.push(tx);
            // console.log('transactions before setItem');
            // console.log(transactions);
            return this.localSt.setItem('mytransactions', transactions).subscribe(() => {
            });
        });
    }

    storeFavoritePairs(favoritePairs: string[] ) {
        return this.localSt.setItem('favoritePairs', favoritePairs).subscribe(() => {});
    }

    getFavoritePairs() {
        return this.localSt.getItem('favoritePairs');
    }   

    storeToTransactionHistoryList(transactionItem: TransactionItem) {
        this.getTransactionHistoryList().subscribe((transactionHistory: TransactionItem[]) => {
            if (!transactionHistory) {
                transactionHistory = [];
            }
            transactionHistory.push(transactionItem);
            // console.log('transactionHistory for storeToTransactionHistoryList=', transactionHistory);
            return this.localSt.setItem('transactions', transactionHistory).subscribe(() => {});
        });
    }  

    updateTransactionHistoryList(transactionItem: TransactionItem) {
        this.getTransactionHistoryList().subscribe((transactionHistory: TransactionItem[]) => {
            if (!transactionHistory) {
                transactionHistory = [];
            }
            for (let i = 0; i < transactionHistory.length; i++) {
                if (transactionHistory[i].txid === transactionItem.txid) {
                    transactionHistory[i].status = transactionItem.status;
                    break;
                }
            }
            // console.log('transactionHistory for storeToTransactionHistoryList=', transactionHistory);
            return this.localSt.setItem('transactions', transactionHistory).subscribe(() => {});
        });
    }     
    getTransactionHistoryList() {
        return this.localSt.getItem('transactions');
    }    


}
