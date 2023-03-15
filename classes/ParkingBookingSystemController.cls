public with sharing class ParkingBookingSystemController {
    
    @AuraEnabled(cacheable=true)
    public static List<Parking_Slot__c> getParkingSlots() {
        return [SELECT Id, Name, Booking__c, Vacant__c FROM Parking_Slot__c ORDER BY Name ASC];
    }

    @AuraEnabled(cacheable=true)
    public static List<Logistic__c> getLogisticsByDate(Date fetchingDate) {
        List<Logistic__c> logistics = [SELECT Id, Parking_Slot__r.Name, Time_Slot__c, Date__c FROM Logistic__c
                                       WHERE Date__c = :fetchingDate
                                       ORDER BY Parking_Slot__c];
        for(Logistic__c log : logistics){
            System.debug('Log recordddddd: '+ log);
        }
        return logistics;
    }

    @AuraEnabled
    public static void deleteLogistic(String timeSlot,String slot){
        System.debug('Time: '+timeSlot+' slot: '+ slot);
        List<Logistic__c> logList = [SELECT Id,Name from Logistic__c WHERE Time_Slot__C =: timeSlot AND Parking_Slot__c =: slot];
        System.debug('Fetched driver: '+logList);
        try{
            delete logList;
            system.debug('Deleted successfully!!!');
        }catch(DMLException e){
            system.debug('While delete error: '+e.getMessage());
        }
    }

    @AuraEnabled
    public static void createLogisticObject(String driverName, String slot, String vehicleNumber, String timeSlot, Date selectedDate){
        System.debug('Create Logistic method called');
        System.debug('Date: '+selectedDate);
        List<Parking_Slot__c> idSet = [SELECT ID FROM Parking_Slot__c WHERE Name=:slot]; 
        Id idSlot = idSet[0].Id;
         createLogisticObjectFuture(driverName,idSlot,vehicleNumber,timeSlot,selectedDate);
    }
    
    @future
    public static void createLogisticObjectFuture(String dname, Id slot, String vehicleNumber, String timeSlot,Date selectedDate){
         Logistic__c logistic = new Logistic__c( Name=dname, Parking_Slot__c=slot, Vehicle_Number__c=vehicleNumber, Time_Slot__c=timeSlot, Date__c=selectedDate );
         System.debug('Create Logistic future method called');
        try {
            insert logistic;
            system.debug('Logistic object inserted succesfully');
        } catch (Exception e) {
            system.debug('While Insert error: '+e.getMessage());
        }
    }
                    
    
}