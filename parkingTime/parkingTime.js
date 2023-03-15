import { LightningElement, track, api, wire } from 'lwc';
import getLogisticsByDate from '@salesforce/apex/LogisticController.getLogisticsByDate';
import createLogisticObject from '@salesforce/apex/LogisticController.createLogisticObject';
import findLogisticRecord from '@salesforce/apex/LogisticController.findLogisticRecord';

export default class ParkingTime extends LightningElement {
    @track selectedDate = null;
    @track isDateSelected = false;
    @track isGetRecordsModalOpen = false;
    @track logisticsMap = []; //to unique Parking spot and related booking
    @track customFormModal = false;
    timeRanges = ['09:00 to 11:00','11:00 to 01:00','01:00 to 03:00','03:00 to 05:00'];
    @track allParking = false;
    @api getRecordInChild = [];

    @track name; //variables to create logistic record
    @track vehicleNumber;
    @track date;
    @track selectedParkingSpot; //(Parking Slot)
    @track selectedBookingTimeSlot; //(Parking Time)

    @track parkingTime = [
        { label: '09:00 to 11:00', value: '09:00 to 11:00' },
        { label: '11:00 to 01:00', value: '11:00 to 01:00' },
        { label: '01:00 to 03:00', value: '01:00 to 03:00' },
        { label: '03:00 to 05:00', value: '03:00 to 05:00' },
    ]; 
    @track defaultParkingSlot = [
        { label: 'P 1', value: 'P 1' },
        { label: 'P 2', value: 'P 2' },
        { label: 'P 3', value: 'P 3' },
        { label: 'P 4', value: 'P 4' }
    ];
    @track parkingSpot = []; //arrays to store comma seperated values to show in picklist

    handleDateChange(event) {
        this.selectedDate = event.target.value;
        this.isDateSelected = true;
        this.selectedLogistic = null;
        this.selectedBookingTimeSlot = null;
    }

    @wire(getLogisticsByDate, { fetchingDate: '$selectedDate' })
    wiredLogistics({ error, data }) {
        if (data) {
            // Create a map with unique parking slot names as keys and their related time slots as values
            const UniquelogisticsMap = new Map();
            data.forEach(logistic => {
                const key = logistic.Parking_Slot__r.Name;
                const value = logistic.Time_Slot__c;
                if (!UniquelogisticsMap.has(key)) {
                    UniquelogisticsMap.set(key, [logistic]);
                } else {
                    UniquelogisticsMap.get(key).push(logistic);
                }
            });
            // Convert the map to an array and assign it to the logisticsMap property
            this.logisticsMap = Array.from(UniquelogisticsMap, ([key, values]) => ({ key, values }));
            console.log('Logistic Data: '+ JSON.stringify(this.logisticsMap));
        } else if (error) {
            console.error(error);
        }
    }

    customAllSpots(){
        this.allParking = true;
        this.customFormModal = true;
    }

    customShowModalPopup(event) { //method to show Logistic record creation popup
        let selectedParking = event.target.dataset.selectedslot;
        this.parkingSpot = [
            {
              label: selectedParking,
              value: selectedParking
            }
          ];
          
        this.customFormModal = true;
        
    }

    customHideModalPopup() {
        ////method to hide Logistic record creation popup
        this.customFormModal = false;
        this.allParking = false;
    }

    saveName(event) { //Saving data into variable from UI
        this.name = event.target.value;
    }

    saveVehicleNumber(event) {
        this.vehicleNumber = event.target.value;
    }

    saveDate(event) {
        this.date = event.target.value;
    }

    handleParkingSpotChange(event) {
        this.selectedParkingSpot = event.target.value;
    }
    handleParkingTimeChange(event) {
        this.selectedBookingTimeSlot = event.target.value;
    }
    
    createObject() {
        //to create logistic object
        createLogisticObject({
            driverName: this.name,
            slot: this.selectedParkingSpot,
            vehicleNumber: this.vehicleNumber,
            timeSlot: this.selectedBookingTimeSlot,
            selectedDate: this.date
        })
            .then((response) => {
                // if(response == true)
                    this.customHideModalPopup();
            })
            .catch((error) => {
                console.log("error: logistic not inserted ", error);
                //this.customHideModalPopup();
            });
    }

    openPopup() {
        this.isGetRecordsModalOpen = true;

        // this.template.querySelector('c-getRecords').
      }
    
      closePopup() {
        this.isGetRecordsModalOpen = false;
      }
    
      submitDates(event) {
        let startingdate = event.target.dataset.startdate;
        let endingdate = event.target.dataset.enddate;
        // this.template.querySelector('c-getRecords').findLogisticRecord(event.detail.value);
        findLogisticRecord({
            startDate:startingdate,
            endDate:endingdate
        }).then((result) => {
            console.log('Get Record: '+ JSON.stringify(result));
            this.getRecordInChild = result;
            this.isGetRecordsModalOpen = false;
        }).catch((error) => {
            console.log('Error in fetching get records data.');
        });
      }
}
