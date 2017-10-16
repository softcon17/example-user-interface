"use strict";(function(){Polymer({is:"machine-dashboard",properties:{timeslots:{type:Array,value:function value(){var hours=[];for(var hour=0;hour<24;hour+=1){if(hour<10){hours.push({"key":""+hour,"val":"0"+hour+":00"})}else{hours.push({"key":""+hour,"val":hour+":00"})}}return hours}},machineStatus:{type:Array,value:[{"key":"Online","val":"Online"},{"key":"Offline","val":"Offline"},{"key":"Disabled","val":"Disabled"}]},dateTimeNow:{type:String,value:new Date().toISOString()},machines:{type:Array,notify:true,value:[]},machinesDropdownData:{type:Array,notify:true,value:[]},bookings:{type:Array,notify:true,value:[]},postMachinesURL:{type:String,value:""},getMachinesURL:{type:String,value:""},putMachinesURL:{type:String,value:""},getBookingsURL:{type:String,value:""},postBookingsURL:{type:String,value:""},showError:{type:Boolean,value:false}},setMachinesDropdownData:function setMachinesDropdownData(){var result=[];if(this.machines){for(var machine=0;machine<this.machines.length;machine+=1){var option={"key":this.machines[machine]["id"],"val":this.machines[machine]["name"]};result.push(option)}this.$["drop-machine-name"].set("items",[]);this.$["drop-machine-name"].set("items",result);this.$["drop-machine"].set("items",[]);this.$["drop-machine"].set("items",result)}},_open_modal:function _open_modal(e,detail,sender){this.$.urlModal.modalButtonClicked()},_refresh_data:function _refresh_data(e,detail,sender){console.log([e.srcElement.parentElement.id,detail,sender]);if(e.srcElement.parentElement.id){if(e.srcElement.parentElement.id==="BookingsRefreshBtn"){this._launch_booking_get_ajax()}else if(e.srcElement.parentElement.id==="UpdateMachineStatusRefreshBtn"||e.srcElement.parentElement.id==="MakeBookingRefreshBtn"||e.srcElement.parentElement.id==="MachineStatusRefreshBtn"){this._launch_machine_get_ajax()}}else{this._launch_machine_get_ajax();this._launch_booking_get_ajax()}},/***************************************************//**        Functions for sending requests         **//***************************************************/launchAjaxRequests:function launchAjaxRequests(){this._launch_machine_get_ajax();this._launch_booking_get_ajax()},_launch_machine_post_ajax:function _launch_machine_post_ajax(){var buildAjax=this.$.restPostMachine;buildAjax.url=this.$["input-post-machine"].value;buildAjax.body=JSON.stringify({"name":this.$["input-machine-name"].value,"location":this.$["input-machine-location"].value});console.log(buildAjax.body);buildAjax.generateRequest()},_launch_machine_get_ajax:function _launch_machine_get_ajax(){var buildAjax=this.$.restGetMachine;buildAjax.url=this.$["input-get-machine"].value||"undefined";buildAjax.generateRequest()},_launch_machine_put_ajax:function _launch_machine_put_ajax(){var buildAjax=this.$.restPutMachine;buildAjax.url=this.$["input-put-machine"].value;buildAjax.body=JSON.stringify({"id":this.$["drop-machine-name"].selected,"status":this.$["drop-machine-status"].selected});console.log(buildAjax.body);buildAjax.generateRequest()},_launch_booking_get_ajax:function _launch_booking_get_ajax(){var buildAjax=this.$.restGetBooking;buildAjax.url=this.$["input-get-booking"].value||"undefined";buildAjax.generateRequest()},_launch_booking_post_ajax:function _launch_booking_post_ajax(){var buildAjax=this.$.restPostBooking;buildAjax.url=this.$["input-post-booking"].value;buildAjax.body=JSON.stringify({"machineid":this.$["drop-machine"].selected,"jobid":this.$["input-job-id"].value,"day":this.$["day-picker-job"].dateTime.substr(0,10),"timeslot":this.$["drop-timeslot"].selected});console.log(buildAjax.body);buildAjax.generateRequest()},/***************************************************//**       Functions for recieving responses       **//***************************************************/_machinePostSuccess:function _machinePostSuccess(event,ironRequest){this._launch_machine_get_ajax();this.restSuccess(ironRequest)},_machineGetSuccess:function _machineGetSuccess(event,ironRequest){this.machines=[];try{var parsedMachines=[];for(var machineIndex=0;machineIndex<ironRequest.response.length;machineIndex+=1){var statusStr=ironRequest.response[machineIndex].status.toLowerCase();parsedMachines.push({id:ironRequest.response[machineIndex].id,location:ironRequest.response[machineIndex].location,name:ironRequest.response[machineIndex].name,status:statusStr})}this.machines=parsedMachines;this.setMachinesDropdownData();this.restSuccess(ironRequest)}catch(e){console.log(e);var alertBox=document.createElement("px-alert-message");alertBox.messageTitle="Uh Oh!";alertBox.message="The machine data couldnt be parsed, See the console for details!";alertBox.visible=true;alertBox.type="important";alertBox.action="dismiss";alertBox.hideBadge="true";alertBox.autoDismiss=5000;Polymer.dom(this.$.alertMessageContainer).appendChild(alertBox)}},_machinePutSuccess:function _machinePutSuccess(event,ironRequest){this._launch_machine_get_ajax();this.restSuccess(ironRequest)},_bookingPostSuccess:function _bookingPostSuccess(event,ironRequest){this._launch_booking_get_ajax();this.restSuccess(ironRequest)},_bookingGetSuccess:function _bookingGetSuccess(event,ironRequest){this.bookings=[];try{var parsedBookings=[];for(var bookingIndex=0;bookingIndex<ironRequest.response.length;bookingIndex+=1){var dateStr=ironRequest.response[bookingIndex].date.substr(0,10);if(ironRequest.response[bookingIndex].timeslot>9){parsedBookings.push({machine_id:ironRequest.response[bookingIndex].machine_id,job_id:ironRequest.response[bookingIndex].job_id,date:dateStr,timeslot:ironRequest.response[bookingIndex].timeslot+":00"})}else{parsedBookings.push({machine_id:ironRequest.response[bookingIndex].machine_id,job_id:ironRequest.response[bookingIndex].job_id,date:dateStr,timeslot:"0"+ironRequest.response[bookingIndex].timeslot+":00"})}}this.bookings=parsedBookings;this.restSuccess(ironRequest)}catch(e){console.log(e);var alertBox=document.createElement("px-alert-message");alertBox.messageTitle="Uh Oh!";alertBox.message="The booking data couldnt be parsed, See the console for details!";alertBox.visible=true;alertBox.type="important";alertBox.action="dismiss";alertBox.hideBadge="true";alertBox.autoDismiss=5000;Polymer.dom(this.$.alertMessageContainer).appendChild(alertBox)}},restSuccess:function restSuccess(ironRequest){var alertBox=document.createElement("px-alert-message");console.log(ironRequest.xhr);alertBox.messageTitle="Woo Hoo!";alertBox.message=ironRequest.status+" ("+ironRequest.statusText+")"+(" - Request to "+ironRequest.xhr.responseURL+" completed successfuly!");alertBox.visible=true;alertBox.type="information";alertBox.action="dismiss";alertBox.hideBadge="true";alertBox.autoDismiss=5000;Polymer.dom(this.$.alertMessageContainer).appendChild(alertBox)},_restFail:function _restFail(event,ironRequest){console.log(this.$.alertMessageContainer);var alertBox=document.createElement("px-alert-message");alertBox.messageTitle="Uh Oh!";alertBox.message=ironRequest.error+" - "+ironRequest.request.__data__.statusText;alertBox.visible=true;alertBox.type="important";alertBox.action="dismiss";alertBox.hideBadge="true";alertBox.autoDismiss=5000;Polymer.dom(this.$.alertMessageContainer).appendChild(alertBox)},attached:function attached(){this.setMachinesDropdownData()}})})();
//# sourceMappingURL=machine-dashboard.js.map
