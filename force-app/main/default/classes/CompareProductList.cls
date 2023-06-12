public with sharing class CompareProductList {
    
    @AuraEnabled(cacheable=true)
    public static ConnectApi.ProductOverviewCollection getProducts(String webstoreId,String effectiveAccountId,List<String> ids){
        List<String> sku = new List<String>();
        List<String> fields = new List<String>();
        
        ConnectApi.ProductOverviewCollection productList = ConnectApi.CommerceCatalog.getProducts(webstoreId, effectiveAccountId, ids, sku, fields,false,false);
       
        return productList;
    }
    
}