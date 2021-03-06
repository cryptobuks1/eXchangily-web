import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WalletRoutingModule } from './wallet-routing.module';
import { WalletComponent } from './wallet.component';
import { WalletDashboardComponent } from './components/dashboard/dashboard.component';
import { NoWalletComponent } from './components/create/no-wallet.component';
import { MnemonicComponent } from './components/mnemonic/mnemonic.component';
import { MnemeditComponent } from './components/mnemonic/mnemedit.component';
import { CreateWalletComponent } from './components/create/createwallet.component';
import { ConfirmMnemonicsComponent } from './components/create/confirmmnem.component';
import { ManageWalletComponent } from './components/manage-wallet/manage-wallet.component';
import { FaqComponent } from './components/faq/faq.component';
import { WalletPwdComponent } from './components/create/wallet-pwd.component';
import { RestoreWalletComponent } from './components/restore/restorewallet.component';
import { TransactionHistoryComponent } from './components/transaction-history/transaction-history.component';
import { AddressKeyComponent } from './modals/components/address-key/address-key.component';

import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { ModalModule } from 'ngx-bootstrap/modal';

import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatTabsModule} from '@angular/material/tabs';
import {MatListModule} from '@angular/material/list';

import { QRCodeModule } from 'angularx-qrcode';

import { TransactionDetailModal } from './modals/transaction-detail/transaction-detail.modal';
import { AddAssetsModal } from './modals/add-assets/add-assets.modal';
import { SendCoinModal } from './modals/send-coin/send-coin.modal';
import { ReceiveCoinModal } from './modals/receive-coin/receive-coin.modal';
import { DepositAmountModal } from './modals/deposit-amount/deposit-amount.modal';
import { RedepositAmountModal } from './modals/redeposit-amount/redeposit-amount.modal';
import { AddGasModal } from './modals/add-gas/add-gas.modal';

import { ShowSeedPhraseModal } from './modals/show-seed-phrase/show-seed-phrase.modal';
import { VerifySeedPhraseModal } from './modals/verify-seed-phrase/verify-seed-phrase.modal';
import { BackupPrivateKeyModal } from './modals/backup-private-key/backup-private-key.modal';
import { DeleteWalletModal } from './modals/delete-wallet/delete-wallet.modal';
import { LoginSettingModal } from './modals/login-setting/login-setting.modal';

import { KanbanService } from '../../services/kanban.service';
import { Web3Service } from '../../services/web3.service';
import { AlertService } from '../../services/alert.service';
import {MatSelectModule} from '@angular/material/select'; 
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatMenuModule} from '@angular/material/menu';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatRadioModule} from '@angular/material/radio';
import { SharedModule } from '../shared/shared.module';
import { TransactionTypePipe } from './pipes/transaction-type.pipe';

@NgModule({
    declarations: [
        WalletDashboardComponent,
        NoWalletComponent,
        TransactionTypePipe,
        MnemonicComponent,
        MnemeditComponent,
        TransactionHistoryComponent,
        CreateWalletComponent,
        ConfirmMnemonicsComponent,
        WalletPwdComponent,
        RestoreWalletComponent,
        WalletComponent,
        ManageWalletComponent,
        FaqComponent,
        AddressKeyComponent,
        TransactionDetailModal,
        AddAssetsModal,
        SendCoinModal,
        ReceiveCoinModal,
        DepositAmountModal,
        RedepositAmountModal,
        ShowSeedPhraseModal,
        VerifySeedPhraseModal,
        AddGasModal,
        BackupPrivateKeyModal,
        DeleteWalletModal,
        LoginSettingModal
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        WalletRoutingModule,
        QRCodeModule,
        MatTabsModule,
        MatListModule,
        MatCheckboxModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatSlideToggleModule,
        MatMenuModule,
        MatRadioModule,
        MatExpansionModule,
        MatGridListModule,
        MatPaginatorModule,
        SharedModule,
        BsDropdownModule.forRoot(),
        CollapseModule.forRoot(),
        ModalModule.forRoot(),

    ],
    providers: [
        KanbanService, Web3Service, AlertService
    ]
})
export class WalletModule { }
