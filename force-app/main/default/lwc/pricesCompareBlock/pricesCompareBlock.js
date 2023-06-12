import { LightningElement, api } from "lwc";

export default class PricesCompareBlock extends LightningElement {
  @api
  unitPrice = 0;

  @api
  listPrice = 0;

  defaultCurrency = "€";

  // get unit price
  get loadUnitPrice() {
    return this.defaultCurrency + this.unitPrice;
  }

  // get list price
  get loadListPrice() {
    return this.defaultCurrency + this.listPrice;
  }

  // check if price are different
  get isPriceDiff() {
    return Number(this.listPrice) !== Number(this.unitPrice);
  }

  renderedCallback() {
    this.countPrisingDiff();
  }

  // set additional product price calculation
  countPrisingDiff() {
    if (!this.isPriceDiff) {
      return;
    }
    let payNumber = 1;
    let unit = Number(this.unitPrice);
    let list = Number(this.listPrice);

    if (unit > 0 && list > 0) {
      while (payNumber * list < payNumber * unit + unit) {
        payNumber++;
        if (payNumber > 50) {
          break;
        }
      }
    }

    let priceBox = this.template.querySelector(".priceBlock");
    priceBox.setAttribute("data-get", Math.floor((payNumber * list) / unit));
    priceBox.setAttribute("data-pay", payNumber);
  }
}
