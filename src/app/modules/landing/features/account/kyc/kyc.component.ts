import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { UserAuth } from '../../../service/user-auth/user-auth.service';
import { UserService } from '../../../service/user/user.service';
import { KycService } from '../../../service/kyc/kyc.service';
import { Kyc } from '../../../models/kyc';

@Component({
  selector: 'app-kyc',
  templateUrl: './kyc.component.html',
  styleUrls: ['./kyc.component.scss']
})
export class KycComponent implements OnInit {
  eventId = 'TGE001';
  photoUrls: Array<string> = new Array(4);
  // photoInfos: Array<{name: string, url: string | ArrayBuffer}> = new Array(4);
  idNum = 0;
  selfieUrls: Array<string> = new Array(4);
  // selfieInfos: Array<{name: string, url: string | ArrayBuffer}> = new Array(4);
  selfNum = 0;
  saftAgreement: Array<string> = new Array(2);
  submitted = false;
  errMsg: string;

  output: HTMLImageElement;

  kycForm: FormGroup;
  couldBeAccredited = false;
  isAccredited = false;
  kycState = 'No KYC documents submited.';
  _userAuth: UserAuth;

  constructor(
    private _userAuthr: UserAuth,
    private _kycService: KycService
  ) {
    this._userAuth = _userAuthr;
  }

  kGet(name: string) {
    return this.kycForm.get(name);
  }

  ngOnInit() {
    if (this._userAuth.kyc === 1) {
      this.kycState = ' is waiting for process';
    } else if (this._userAuth.kyc === 1 || this._userAuth.kyc === 2) {
      this.kycState = ' is in process';
    } else if (this._userAuth.kyc === 3) {
      this.kycState = ' is failure';
    } else if (this._userAuth.kyc === 100) {
      this.kycState = 'is passed';
    }

    this.kycForm = new FormGroup({
      'name': new FormControl('', [
        Validators.required
      ]),
      'email': new FormControl('', [
        Validators.required,
        Validators.email
      ]),
      'dateOfBirth': new FormControl('', [
        Validators.required
      ]),
      'countryOfBirth': new FormControl('', [
        Validators.required
      ]),
      'homeAddress': new FormControl('', [
        Validators.required
      ]),
      'countryOfResidency': new FormControl('', [
        Validators.required
      ]),
      'saftAgreement' : new FormControl(''),
      'photoUrls': new FormControl('', [
      //  Validators.required
      ]),
      'selfieUrls': new FormControl('', [
      //  Validators.required
      ])
    });
  }

  accreditedInvestorToggle(country) {
    country = country.target.value.toLowerCase();
    if ((country === 'can' || country === 'usa') && !this.couldBeAccredited) {
      // toggle fields
      this.kycForm.addControl('accreditedInvestor', new FormControl(false, []));
      this.couldBeAccredited = true;
    } else if (this.couldBeAccredited && (country !== 'can' && country !== 'usa')) {
      this.kycForm.removeControl('accreditedInvestor');
      this.couldBeAccredited = false;
      this.saftAgreement = [];
    }
  }

  photoUpload(files: Array<File>, type: string) {
    const scope = this;
    if (type === 'photoUrls') {
      // this.photoUrls = [];
    } else if (type === 'selfieUrls') {
      // this.selfieUrls = [];
    } else {
      // this.saftAgreement = [];
    }

    let ff: File;
    for (let i = 0; i < files.length; i++) {
      const f = new FileReader();
      ff = files[i];

      f.onload = (function(theFile) {
        return function(e) {
          if (type === 'photoUrls') {
            scope.photoUrls.push(e.target.result);
            scope.output = <HTMLImageElement>document.getElementById('id' + ++scope.idNum);
            scope.output.src = <string>f.result;
          } else if (type === 'selfieUrls') {
            scope.selfieUrls.push(e.target.result);
            scope.output = <HTMLImageElement>document.getElementById('self' + ++scope.selfNum);
            scope.output.src = <string>f.result;
          } else {
            scope.saftAgreement.push(e.target.result);
          }
        };
      })(ff);
      f.readAsDataURL(ff);
    }
  }

  saveKyc () {
    this.errMsg = '';
    if (this.kGet('name').value.length < 1) {
      this.errMsg = 'Must provide valid name';
      return;
    }
    if (this.kGet('email').value.length < 4) {
      this.errMsg = 'Must provide valid email address';
      return;
    }

    if (this.idNum < 1) {
      if (this._userAuth.language === 'English') {
        this.errMsg = 'Must provide valid identity photos.';
      } else if (this._userAuth.language === '简体中文') {
        this.errMsg = '必须提供合格身份证明照片。';
      }
      return;
    }

    if (this.selfNum < 1) {
      if (this._userAuth.language === 'English') {
        this.errMsg = 'Must provide valid selfie pictures.';
      } else if (this._userAuth.language === '简体中文') {
        this.errMsg = '必须提供合格本人手持身份证明图像。';
      }
      return;
    }

    const theKyc: Kyc =  {
      memberId: this._userAuth.id,
      name: this.kGet('name').value,
      countryOfBirth: this.kGet('countryOfBirth').value,
      accreditedInvestor: false,
      dateOfBirth: this.kGet('dateOfBirth').value,
      countryOfResidency: this.kGet('countryOfResidency').value,
      homeAddress: this.kGet('homeAddress').value,
      saftAgreement: this.saftAgreement[0],
      email: this.kGet('email').value,
      photoUrls: this.photoUrls,
      selfieUrls: this.selfieUrls
    };

    this._kycService.createKyc(theKyc).subscribe(
      ret => {
        this.photoUrls = new Array(4);
        this.submitted = true;
        this.errMsg = '';
        this.kycState = 'Your KYC documents submitted successful, please waiting for verification.';
        if (this._userAuth.language === '简体中文') {
          this.kycState = '您已成功提交KYC资料，请等候2~4个工作日审查结果。';
        }
        this._userAuth.kyc = 1;
      },
      err => {
        if (this._userAuth.language === 'English') {
          this.errMsg = 'KYC submision failure:' + JSON.stringify(err);
        } else if (this._userAuth.language === '简体中文') {
          this.errMsg = 'KYC 资料提交失败: ' + JSON.stringify(err);
        }
      }
    );
  }

  /**
   * Checks if the given string is an address
   *
   * @method isAddress
   * @param {String} address the given HEX adress
   * @return {Boolean}
   */
  isAddress (address: string) {
    const addd = address.toLowerCase();
    if (!/^(0x)?[0-9a-f]{40}$/i.test(addd)) {
      // check if it has the basic requirements of an address
      return false;
    } else if (/^(0x)?[0-9a-f]{40}$/.test(addd) || /^(0x)?[0-9A-F]{40}$/.test(addd)) {
      // If it's all small caps or all all caps, return true
      return true;
    } else {
      if (address && address.length === 40 && address[0] === '0' && addd[1] === 'x') {
        return true;
      } else {
        return false;
      }
    }
  }
}
