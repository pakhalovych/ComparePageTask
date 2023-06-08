import { LightningElement ,api,wire} from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { getAppContext,getSessionContext} from 'commerce/contextApi';
import getProducts from '@salesforce/apex/CompareProductList.getProducts'
import {  getCompareList, removeFromCompareList } from 'c/utils';
import compareImage from '@salesforce/resourceUrl/comparePage';


export default class ComparePage extends NavigationMixin(LightningElement) {

webstoreId;
effectiveAccountId;
list = [1,2,3,4];
bestOptionImages = {
    left: compareImage + '/images/leftGood.png',
    right: compareImage + '/images/rightGood.png',
}

@api
compareProductList=[];
cursorInTable = false;
productIds;
fieldsToCompare = ['Name','Description','Family'];
checkInterval;

tableMouse = {
    lastCord : {x:0,y:0},
    currCord : {x:0,y:0}
}



@wire(getProducts,{webstoreId: '$webstoreId',effectiveAccountId : '$effectiveAccountId',ids : '$productIds' })
loadProducts({error,data}){
    if(data){
        console.log(data)
      this.compareProductList = this.createTableInfo(data);
      console.log(this.compareProductList, this.isProductToCompare)
    }else if(error){
        console.log(error);
    }
}

    connectedCallback() {

        getSessionContext().then(response => {
            console.log(response)
            this.effectiveAccountId = response.effectiveAccountId
        }).catch(error=> {
            console.log(error)
        })

        getAppContext().then(response => {
            console.log(response)
            this.webstoreId=response.webstoreId
        }).catch(error=> {
            console.log(error)
        })

        this.productIds = this.loadCompareList();

    }

    renderedCallback()
    {
            // this.getUserFocus();
    }



    
    get bestPriceId(){
        return this.productIds[0];
    }


    get isProductToCompare(){
        return  this.compareProductList.length > 0;
    }

    createTableInfo(data){
        let tableInfo = []

       if(data.hasOwnProperty('products')){
            data.products.forEach(product=>{

                if(product.success === true){
                    let productToCompare = {};
                    productToCompare['id'] = product.id;
                    productToCompare['image'] = {
                        url : product.defaultImage.url,
                        alt : product.defaultImage.alternateText
                    }

                    productToCompare['fields'] = product.fields;

                    if(product.prices.success == true){
                        productToCompare['prices'] = {
                            unit : product.prices.unitPrice,
                            listPrice : product.prices.listPrice
                        }
                    }
                    tableInfo.push(productToCompare);
                }

            })
       }

       return tableInfo;
    }


    loadCompareList(){
        let productList = getCompareList();

        let ids = Object.keys(productList)

        if(ids.length>0){
            return ids;
        }

        return {};

    }


    addToCartFromCompare(e){
           let element = e.target;
            let cartBox = document.querySelector('commerce_cart-badge');
            console.log(cartBox)
            if(cartBox){
                let cordCartBox = cartBox.getBoundingClientRect();
                let productImageToCreate = this.template.querySelector('[data-product="'+element.dataset.productAdd+'"] > img.productImage')
                
                if(productImageToCreate){
                    let imgPos = productImageToCreate.getBoundingClientRect()
                    let animImg = productImageToCreate.cloneNode();
                    animImg.style.cssText = 'width:'+imgPos.width+'px;left:'+imgPos.x+'px;top:'+imgPos.y+'px;position:fixed;'
                    let insertedImg = productImageToCreate.parentElement.appendChild(animImg);
                    insertedImg.ontransitionend = ()=> {insertedImg.remove();productImageToCreate.style.cssText = 'opacity:1;'}
                    productImageToCreate.style.cssText = 'opacity:0;transition:opacity 0.2s ;'
                    setTimeout(()=>{
                        insertedImg.style.transform = ' translate('+(cordCartBox.x-imgPos.x+imgPos.width/2)+'px,'+(cordCartBox.y-imgPos.y-imgPos.height/2)+'px)'
                        insertedImg.style.opacity = 0
                    },200)
                }                
            }
            this.cursorInTable = false;
            this.resetButtonsMove()
        }

        setNewproductList(){
            this.list.pop()
            console.log('render new table')
        }

        removeProductAnim(e){
           let element=e.target;
            let columnToRemove = this.template.querySelectorAll('[data-product="'+element.dataset.productRemove+'"]')
            if(this.list.length==1){
                this.setNewproductList()
                return;
            }

            columnToRemove.forEach((td,idx)=>{    
                td.style.opacity = 0
                td.style.cssText ='width:0;min-width:0;padding:0;'
                td.innerHTML =""

                td.ontransitionend = (e)=>{
                    if(e.propertyName === 'min-width') {
                        td.remove()
                        if(idx==(columnToRemove.length-1)){
                            this.setNewproductList()
                        }                        
                    }
                }
                
            })
        }

        bestOption(e){

            let element = e.target;
            let show = e.type== 'mouseenter' ? true : false;
            let option = element.dataset.bestOption
            let moveFrame = this.template.querySelector('.selectedProduct');
            let bestOptionBlock = this.template.querySelector('[data-product="'+option+'"]');
            let rightHandsImage = this.template.querySelector('.rightGood')
            let leftHandsImage = this.template.querySelector('.leftGood')

            if(bestOptionBlock){
                let bestOption = this.template.querySelector('[data-product="'+option+'"]').getBoundingClientRect()

            if(show){
                moveFrame.style.cssText = 'width:'+bestOption.width+'px;transform:translateX('+(bestOption.x-moveFrame.getBoundingClientRect().x)+'px);opacity:1;'
                rightHandsImage.style.transform = 'translate(0,0)'
                leftHandsImage.style.transform = 'translate(0,0)'
            }else{
                rightHandsImage.style.transform = 'translate(100%,0)'
                leftHandsImage.style.transform = 'translate(-100%,0)'
                moveFrame.style.cssText = 'width:'+bestOption.width+'px;transform:translateX(0px);opacity:0;'
            }
            }
          
            
        }

        resetButtonsMove()
        {
            this.template.querySelectorAll(".addToCartCustom").forEach(cartBtn=>{
                cartBtn.style.transform = "translate(0,0)"
            })
        }


        intervalMouseCheck(){
            let checkInterval = setInterval(()=>{

                if(this.tableMouse.lastCord.x == this.tableMouse.currCord.x && this.tableMouse.lastCord.y == this.tableMouse.currCord.y){
    
                    this.template.querySelectorAll(".addToCartCustom").forEach(cartBtn=>{
                        let btn = cartBtn.parentElement.getBoundingClientRect();
                        if(this.tableMouse.currCord.x>btn.x && this.tableMouse.currCord.x<(btn.x+btn.width) && this.tableMouse.currCord.y< btn.y && this.cursorInTable){
                            cartBtn.style.transform = 'translate(0,'+(this.tableMouse.currCord.y-btn.y-btn.height/2)+'px)'
                        }else{
                            cartBtn.style.transform = 'translate(0,0)'
                        }
                    })
                }
    
                this.tableMouse.lastCord.x = this.tableMouse.currCord.x;
                this.tableMouse.lastCord.y = this.tableMouse.currCord.y;
    
               },2000)

               return checkInterval;
        }

        getUserFocus(e){
            if(!this.checkInterval){
                console.log('interval Created')
                this.checkInterval = this.intervalMouseCheck();
            }
              
           this.tableMouse.currCord.x = e.x;
           this.tableMouse.currCord.y = e.y;
                this.cursorInTable = true;
        }

        deactivateTableListening(){
            this.cursorInTable = false;
        }

}