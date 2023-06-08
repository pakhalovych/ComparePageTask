import { LightningElement,api, wire } from 'lwc';
import { ProductAdapter, ProductPricingAdapter } from 'commerce/productApi'
import {  checkProductCompareList, addProductToCompareList } from 'c/utils';
import { NavigationMixin } from 'lightning/navigation';


export default class AddToCompare extends NavigationMixin(LightningElement) {

@api recordId;
@api objectApiName;
@api productId;

isProductInCompareList = false; 

prepareObjectTocompare = {
    data:false, 
    price:false,
    createdAt: false
}

error;


    @wire(ProductAdapter,{productId: '$recordId'})
    wiredAccount({ error, data }) {
        if (data) {
            this.prepareObjectTocompare.data = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
        }
    }


    @wire(ProductPricingAdapter,{productId: '$recordId'})
    wiredPrice({ error, data }) {
        if (data) {
            this.prepareObjectTocompare.price = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
        }
    }



    getTimeExpired(){
        let hoursExipired = 0;
        let today = new Date();
        today.setHours(today.getHours() + hoursExipired);
        return Math.floor(today.getTime() / 1000);
    }

    

connectedCallback(){
    this.isProductInCompareList = checkProductCompareList(this.recordId);
    this.prepareObjectTocompare.createdAt = this.getTimeExpired()
}


navigateToComparePage(){
    this[NavigationMixin.Navigate]({
        type: 'comm__namedPage',
            attributes: {
                name: 'Compare_page__c'
            }
    });
}

sendToCompare(){
   if(this.prepareObjectTocompare.data){
    
    addProductToCompareList(this.recordId,this.prepareObjectTocompare)
    this.isProductInCompareList = true;
    
    


   }
}

}