import { LightningElement, wire } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { getAppContext, getSessionContext } from "commerce/contextApi";
import getProducts from "@salesforce/apex/CompareProductList.getProducts";
import { getCompareList, removeFromCompareList } from "c/utils";
import compareImage from "@salesforce/resourceUrl/comparePage";
import { addItemToCart } from "commerce/cartApi";

export default class ComparePage extends NavigationMixin(LightningElement) {
  webstoreId;
  effectiveAccountId;
  list = [1, 2, 3, 4];
  bestOptionImages = {
    left: compareImage + "/images/leftGood.png",
    right: compareImage + "/images/rightGood.png"
  };
  bestPriceId;
  compareProductList = [];
  cursorInTable = false;
  productIds;
  fieldsToCompare = ["Name", "Description", "Family"];
  checkInterval;
  loadingProductsToCompare = true;
  tableMouse = {
    lastCord: { x: 0, y: 0 },
    currCord: { x: 0, y: 0 }
  };
  notificationInfoFromCompare = {}



  @wire(getProducts, {
    webstoreId: "$webstoreId",
    effectiveAccountId: "$effectiveAccountId",
    ids: "$productIds"
  })
  loadProducts({ error, data }) {
    if (data) {
      this.compareProductList = this.createTableInfo(data);
      this.bestPriceId = this.getBestPriceId();
    } else if (error) {
      console.log(error);
    }

    this.loadingProductsToCompare = false;
  }

  connectedCallback() {
    getSessionContext()
      .then((response) => {
        this.effectiveAccountId = response.effectiveAccountId;
      })
      .catch((error) => {
        console.log(error);
      });

    getAppContext()
      .then((response) => {
        this.webstoreId = response.webstoreId;
      })
      .catch((error) => {
        console.log(error);
      });

    this.productIds = this.loadCompareList();
  }


get notificationExist(){
 return Object.keys(this.notificationInfoFromCompare).length > 0;
}

  getBestPriceId() {
    let productId = "";
    let lastPrice = 0;
    if (this.compareProductList.length > 0) {
      this.compareProductList.forEach((product, idx) => {
        if (product.prices.unit < lastPrice || idx === 0) {
          productId = product.id;
          lastPrice = product.prices.unit;
        }
      });
    }
    return productId;
  }

  get isProductToCompare() {
    return this.compareProductList.length > 0;
  }

  createTableInfo(data) {
    let tableInfo = [];

    if (data.hasOwnProperty("products")) {
      data.products.forEach((product) => {
        if (product.success === true) {
          let productToCompare = {};
          productToCompare["id"] = product.id;
          productToCompare["image"] = {
            url: product.defaultImage.url,
            alt: product.defaultImage.alternateText
          };

          productToCompare["fields"] = product.fields;

          if (product.prices.success == true) {
            productToCompare["prices"] = {
              unit: product.prices.unitPrice,
              listPrice: product.prices.listPrice
            };
          }
          tableInfo.push(productToCompare);
        }
      });
    }

    return tableInfo;
  }

  loadCompareList() {
    let productList = getCompareList();

    let ids = Object.keys(productList);

    if (ids.length > 0) {
      return ids;
    }

    return {};
  }

  addToCartFromCompare(e) {
    let element = e.target;
    let cartBox = document.querySelector("commerce_cart-badge");
    console.log(element.dataset.processing);
    let textButton = element.innerText;

    if (element.dataset.processing == "false") {
      element.innerText = "Processing ... ";
      element.setAttribute("data-processing", true);
      element.classList.add("processingCart");

      addItemToCart(element.dataset.productAdd, 1)
        .then((response) => {
          console.log(response);
          if (cartBox) {
            let cordCartBox = cartBox.getBoundingClientRect();
            let productImageToCreate = this.template.querySelector(
              '[data-product="' +
                element.dataset.productAdd +
                '"] > img.productImage'
            );

            if (productImageToCreate) {
              let imgPos = productImageToCreate.getBoundingClientRect();
              let animImg = productImageToCreate.cloneNode();
              animImg.style.cssText =
                "width:" +
                imgPos.width +
                "px;left:" +
                imgPos.x +
                "px;top:" +
                imgPos.y +
                "px;position:fixed;";
              let insertedImg =
                productImageToCreate.parentElement.appendChild(animImg);
              insertedImg.ontransitionend = () => {
                insertedImg.remove();
                productImageToCreate.style.cssText = "opacity:1;";
              };
              productImageToCreate.style.cssText =
                "opacity:0;transition:opacity 0.2s ;";
              // eslint-disable-next-line @lwc/lwc/no-async-operation
              setTimeout(() => {
                insertedImg.style.transform =
                  " translate(" +
                  (cordCartBox.x - imgPos.x + imgPos.width / 2) +
                  "px," +
                  (cordCartBox.y - imgPos.y - imgPos.height / 2) +
                  "px)";
                insertedImg.style.opacity = 0;
              }, 200);
            }
          }
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          element.style.animationIterationCount = 1;
          element.onanimationend = () => {
            element.classList.remove("processingCart");
            element.innerHTML = textButton;
            element.setAttribute("data-processing", false);
            this.cursorInTable = false;
            this.resetButtonsMove();
          };
          this.notificationInfoFromCompare = {type : 'success',text : 'Product was added to cart'}
        });
    }
  }

  setNewproductList(productId) {
    this.compareProductList.forEach((product, idx) => {
      if (product.id === productId) {
        this.compareProductList.splice(idx, 1);
        // eslint-disable-next-line no-useless-return
        return;
      }
    });

    this.bestPriceId = this.getBestPriceId();
    removeFromCompareList(productId);
    console.log("render new table");
  }

  removeProductAnim(e) {
    let element = e.target;
    let columnToRemove = this.template.querySelectorAll(
      '[data-product="' + element.dataset.productRemove + '"]'
    );
    if (this.compareProductList.length === 1) {
      this.setNewproductList(element.dataset.productRemove);
      return;
    }

    columnToRemove.forEach((td, idx) => {
      td.style.opacity = 0;
      td.style.cssText = "width:0;min-width:0;padding:0;";
      td.innerHTML = "";

      td.ontransitionend = (e) => {
        if (e.propertyName === "min-width") {
          // td.remove();
          if (idx === columnToRemove.length - 1) {
            this.setNewproductList(element.dataset.productRemove);
          }
        }
      };
    });
  }

  bestOption(e) {
    let element = e.target;
    let elementBox = element.getBoundingClientRect();
    let show = e.type === "mouseenter" ? true : false;
    let option = element.dataset.bestOption;
    let moveFrame = this.template.querySelector(".selectedProduct");
    let scrollTable = this.template.querySelector(".scrollTableWrap");
    let bestOptionBlock = this.template.querySelector(
      '[data-product="' + option + '"]'
    );
    let rightHandsImage = this.template.querySelector(".rightGood");
    let leftHandsImage = this.template.querySelector(".leftGood");

    if (bestOptionBlock) {
      let bestOption = bestOptionBlock
        .getBoundingClientRect();

      if (show) {

        if(scrollTable.getBoundingClientRect().x < scrollTable.scrollWidth){
          bestOptionBlock.scrollIntoView({ behavior: "smooth",block: "nearest", inline: "center" })
          
        }

        moveFrame.style.cssText =
          "width:" +
          bestOption.width +
          "px;transform:translateX(" +
          (bestOption.x - moveFrame.getBoundingClientRect().x) +
          "px);opacity:1;";
        rightHandsImage.style.transform = "translate(0,0)";
        leftHandsImage.style.transform = "translate(0,0)";
      } else {
        rightHandsImage.style.transform = "translate(100%,0)";
        leftHandsImage.style.transform = "translate(-100%,0)";
        moveFrame.style.cssText =
          "width:" +
          bestOption.width +
          "px;transform:translateX(0px);opacity:0;";
      }
    }
  }

  resetButtonsMove() {
    this.template.querySelectorAll(".addToCartCustom").forEach((cartBtn) => {
      cartBtn.style.transform = "translate(0,0)";
    });
  }

  intervalMouseCheck() {
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    let checkInterval = setInterval(() => {
      if (
        this.tableMouse.lastCord.x === this.tableMouse.currCord.x &&
        this.tableMouse.lastCord.y === this.tableMouse.currCord.y
      ) {
        this.template
          .querySelectorAll(".addToCartCustom")
          .forEach((cartBtn) => {
            let btn = cartBtn.parentElement.getBoundingClientRect();
            if (
              this.tableMouse.currCord.x > btn.x &&
              this.tableMouse.currCord.x < btn.x + btn.width &&
              this.tableMouse.currCord.y < btn.y &&
              this.cursorInTable
            ) {
              cartBtn.style.transform =
                "translate(0," +
                (this.tableMouse.currCord.y - btn.y - btn.height / 2) +
                "px)";
            } else {
              cartBtn.style.transform = "translate(0,0)";
            }
          });
      }

      this.tableMouse.lastCord.x = this.tableMouse.currCord.x;
      this.tableMouse.lastCord.y = this.tableMouse.currCord.y;
    }, 3000);

    return checkInterval;
  }

  getUserFocus(e) {
    if (!this.checkInterval) {
      this.checkInterval = this.intervalMouseCheck();
    }

    this.tableMouse.currCord.x = e.x;
    this.tableMouse.currCord.y = e.y;
    this.cursorInTable = true;
  }

  navigateToProduct(e) {
    this[NavigationMixin.Navigate]({
      type: "standard__recordPage",
      attributes: {
        recordId: e.target.dataset.product,
        objectApiName: "Product2",
        actionName: "view"
      }
    });
  }

  deactivateTableListening() {
    this.cursorInTable = false;
  }
}
