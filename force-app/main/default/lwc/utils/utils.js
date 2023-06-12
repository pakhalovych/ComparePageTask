const getConstants = () => {
  return {
    rootCompare: "customComparePage"
  };
};

// Return compare list object from local storage
const getCompareList = () => {
  let compareObject = {};
  let localInfo = localStorage.getItem(getConstants().rootCompare);

  if (localInfo) {
    try {
      compareObject = JSON.parse(localInfo);
    } catch (e) {
      localStorage.removeItem(getConstants().rootCompare);
      compareObject = {};
    }
  }

  return compareObject;
};

// Return bool
const checkProductCompareList = (productId) => {
  let compareList = getCompareList();
  return compareList.hasOwnProperty(productId);
};

// remove product from compare list
const removeFromCompareList = (productId) => {
  let compareList = getCompareList();

  if (checkProductCompareList(productId)) {
    delete compareList[productId];
    localStorage.setItem(
      getConstants().rootCompare,
      JSON.stringify(compareList)
    );
  }

  return compareList;
};

// Add product to compare list
const addProductToCompareList = (productId, productData) => {
  let compareList = getCompareList();
  compareList[productId] = productData;
  localStorage.setItem(getConstants().rootCompare, JSON.stringify(compareList));
  return compareList;
};

export {
  getConstants,
  getCompareList,
  checkProductCompareList,
  removeFromCompareList,
  addProductToCompareList
};
