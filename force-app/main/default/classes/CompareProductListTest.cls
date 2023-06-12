@IsTest(SeeAllData=true)
private class CompareProductListTest {
    @IsTest(SeeAllData=true)
    static void testGetProducts() {

        String webstoreId = '0ZE7Q000000p5fiWAA';
        String effectiveAccountId = '0017Q00000y58QE';
        List<String> ids = new List<String>{'01t7Q000004FO4FQAW','01t7Q000004FO4BQAW','01t7Q000004FO3wQAG'};
        
        Test.startTest();
        
        ConnectApi.ProductOverviewCollection actualProductList = CompareProductList.getProducts(webstoreId, effectiveAccountId, ids);
        
        Test.stopTest();
        
        System.assertEquals(3, actualProductList.products.size(), 'Product list does not match the expected value');
    }
}