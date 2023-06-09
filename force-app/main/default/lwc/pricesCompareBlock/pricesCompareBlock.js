import { LightningElement, api } from 'lwc';

export default class PricesCompareBlock extends LightningElement {

@api
unitPrice = 0;

@api
listPrice = 0;

payForNumber;
getNumber;

defaultCurrency = '€';

get isPriceDiff(){
    return Number(this.listPrice) !== Number(this.unitPrice);
}


renderedCallback(){
    this.countPrisingDiff();
}

countPrisingDiff(){
    let payNumber = 1;
    let unit = Number(this.unitPrice);
    let list = Number(this.listPrice);

    if(this.isPriceDiff && unit > 0 && list > 0){
        console.log(unit, list, 'first',payNumber*list ,  payNumber*unit + unit)
        while((payNumber*list) < (payNumber*unit + unit)){
            payNumber++;
            if(payNumber > 50){
                break;
            }
        }
    }

    let priceBox = this.template.querySelector('.priceBlock');
    priceBox.setAttribute('data-get',Math.floor((payNumber*list)/unit));
    priceBox.setAttribute('data-pay',payNumber);
}


}