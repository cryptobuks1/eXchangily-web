import { Component, OnInit, Input, ViewChild } from '@angular/core';
import {StorageService} from '../../../../services/storage.service';
import { TransactionItem } from '../../../../models/transaction-item';
import {CoinsPrice} from '../../../../interfaces/balance.interface';
import {UtilService} from '../../../../services/util.service';
import {ApiService} from '../../../../services/api.service';
import {KanbanService} from '../../../../services/kanban.service';
import { TransactionDetailModal } from '../../modals/transaction-detail/transaction-detail.modal';

@Component({
    selector: 'app-transaction-history',
    templateUrl: './transaction-history.component.html',
    styleUrls: ['./transaction-history.component.css']
})
export class TransactionHistoryComponent implements OnInit {

    @ViewChild('transactionDetailModal', {static: true}) transactionDetailModal: TransactionDetailModal;


    transactionHistory: TransactionItem[];
    @Input() coinsPrice: CoinsPrice;
    @Input() walletId: string;
    currentType: string;
    constructor ( 
        private storageService: StorageService, 
        private apiServ: ApiService, 
        private utilServ: UtilService,
        private kanbanServ: KanbanService 
        ) {

    }
    changeType(type: string) {
        this.currentType = type;
    }
    ngOnInit() {
        this.currentType = 'All';
        this.storageService.getTransactionHistoryList().subscribe(
            (transactionHistory: TransactionItem[]) => {
                console.log('transactionHistory=', transactionHistory);
                if (transactionHistory) {
                    this.transactionHistory = transactionHistory.reverse().filter( s => s.walletId === this.walletId);
                }
            }
        );
    }

/*

                this.kanbanServ.getDepositStatusSync(txid).subscribe((res: any) => {
                    if (res && res.code !== undefined) {
                        const code = res.code;
                        let status = '';
                        if (code === 0) {
                            status = 'confirmed';
                        } else
                        if (code === 2) {
                            status = 'failed';
                        } else
                        if (code === 3) {
                            status = 'claim';
                        }

*/    
    async showTransactionDetail(item: TransactionItem) {
        console.log('item is:', item);
        if (item.type === 'Withdraw') {
            const status = await this.kanbanServ.getTransactionStatus(item.txid);
            item.confirmations = status;
        } else
        if (item.type === 'Deposit') {
            const status = await this.kanbanServ.getDepositStatus(item.txid);
            item.confirmations = status;
        } else
        if (item.coin === 'BTC') {
            const tx = await this.apiServ.getBtcTransaction(item.txid);
            item.confirmations = tx.confirmations;
            item.blockhash = tx.blockhash;
        } else 
        if (item.coin === 'ETH' || item.tokenType === 'ETH') {
            const tx = await this.apiServ.getEthTransaction(item.txid);
            item.confirmations = '0';
            if (tx.blockNumber) {
                item.confirmations = tx.confirmations;
            }
            item.blockhash = tx.blockHash;            
        } else
        if (item.coin === 'FAB' || item.tokenType === 'FAB') {
            const tx = await this.apiServ.getFabTransactionJson(item.txid);
            console.log('tx in fab token:', tx);
            item.confirmations = '0';
            if (tx.confirmations) {
                item.confirmations = tx.confirmations.toString();
            }
            item.blockhash = tx.blockhash;    
        } 
        this.transactionDetailModal.show(item);
    }
}
