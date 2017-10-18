(function() {

  Polymer({
    is: 'machine-dashboard',
    properties: {
      timeslots: {
        type: Array,
        value: function () {
          let hours = [];
          for (let hour = 0; hour < 24; hour += 1) {
            if (hour < 10) {
              hours.push({
                "key": `${hour}`,
                "val": `0${hour}:00`
              });
            }
            else {
              hours.push({
                "key": `${hour}`,
                "val": `${hour}:00`
              });
            }
          }
          return hours;
        }
      },
      machineStatus: {
        type: Array,
        value:  [
          {
            "key":"Online",
            "val":"Online"
          },
          {
            "key":"Offline",
            "val":"Offline"
          },
          {
            "key":"Disabled",
            "val":"Disabled"
          }
        ]
      },
      dateTimeNow: {
        type: String,
        value: new Date().toISOString()
      },
      machines: {
        type: Array,
        notify: true,
        value: []
      },
      machinesDropdownData: {
        type: Array,
        notify: true,
        value: []
      },
      bookings: {
        type: Array,
        notify: true,
        value: []
      },
      postMachinesURL: {
        type: String,
        value: ""
      },
      getMachinesURL: {
        type: String,
        value: ""
      },
      putMachinesURL: {
        type: String,
        value: ""
      },
      getBookingsURL: {
        type: String,
        value: ""
      },
      postBookingsURL: {
        type: String,
        value: ""
      },
      showError: {
        type: Boolean,
        value: false
      }
    },
    setMachinesDropdownData: function() {
      let result = [];
      if (this.machines) {
        for (let machine = 0; machine < this.machines.length; machine += 1) {
          let option = {
            "key":this.machines[machine]["id"],
            "val":this.machines[machine]["name"]
          };
          result.push(option);
        }

        this.$['drop-machine-name'].set('items', []);
        this.$['drop-machine-name'].set('items', result);

        this.$['drop-machine'].set('items', []);
        this.$['drop-machine'].set('items', result);
      }
    },

    _open_modal: function(e, detail, sender) {
      this.$.urlModal.modalButtonClicked();
    },

    _refresh_data(e, detail, sender) {
      console.log([e.srcElement.parentElement.id, detail, sender]);
      if (e.srcElement.parentElement.id) {
        if (e.srcElement.parentElement.id === "BookingsRefreshBtn") {
          this._launch_booking_get_ajax();
        }
        else if (
            e.srcElement.parentElement.id === "UpdateMachineStatusRefreshBtn" ||
            e.srcElement.parentElement.id === "MakeBookingRefreshBtn" ||
            e.srcElement.parentElement.id === "MachineStatusRefreshBtn" ) {
          this._launch_machine_get_ajax();
        }
      }
      else {
        this._launch_machine_get_ajax();
        this._launch_booking_get_ajax();
      }
    },

    /***************************************************/
    /**        Functions for sending requests         **/
    /***************************************************/
    launchAjaxRequests: function () {
      this._launch_machine_get_ajax();
      this._launch_booking_get_ajax();
    },

    _launch_machine_post : function() {
      if (this.$['input-machine-name'].value && this.$['input-machine-location'].value) {
        this.launch_machine_post_ajax(JSON.stringify({
          "name": this.$['input-machine-name'].value,
          "location": this.$['input-machine-location'].value
        }));
      }
      else {
        this.displayAlert(
          'Uh Oh!',
          'There is no machine data to send!',
          'important'
        );
      }
    },
    _do_machine_post: function() {
      this.launch_machine_post_ajax({});
    },

    launch_machine_post_ajax: function(body) {
      let buildAjax = this.$.restPostMachine;
      buildAjax.url = this.$['input-post-machine'].value;
      buildAjax.body = body;
      buildAjax.generateRequest();
    },

    _launch_machine_get_ajax: function() {
      let buildAjax = this.$.restGetMachine;
      buildAjax.url = this.$['input-get-machine'].value || 'undefined';
      buildAjax.generateRequest();
    },

    _launch_machine_put : function() {
      if (this.$['drop-machine-name'].selected && this.$['drop-machine-status'].selected) {
        this.launch_machine_put_ajax(JSON.stringify({
          "id": this.$['drop-machine-name'].selected,
          "status": this.$['drop-machine-status'].selected
        }));
      }
      else {
        this.displayAlert(
          'Uh Oh!',
          'There is no machine data to send!',
          'important'
        );
      }
    },
    _do_machine_put: function() {
      this.launch_machine_put_ajax({});
    },
    launch_machine_put_ajax: function(body) {
      let buildAjax = this.$.restPutMachine;
      buildAjax.url = this.$['input-put-machine'].value;
      buildAjax.body = body;
      buildAjax.generateRequest();
    },
    _launch_booking_get_ajax: function() {
      let buildAjax = this.$.restGetBooking;
      buildAjax.url = this.$['input-get-booking'].value  || 'undefined';
      buildAjax.generateRequest();
    },

    _launch_booking_post: function() {
      if (((this.$['drop-machine'].selected && this.$['input-job-id'].value)
          && this.$['drop-timeslot'].selected)
          && this.$['input-post-booking'].value ) {

        this.launch_booking_post_ajax(JSON.stringify({
          "machineid": this.$['drop-machine'].selected,
          "jobid": this.$['input-job-id'].value,
          "day": this.$['day-picker-job'].dateTime.substr(0, 10),
          "timeslot": this.$['drop-timeslot'].selected}));
      }
      else {
        this.displayAlert(
          'Uh Oh!',
          'There is no booking data to send!',
          'important'
        );
      }
    },
    _do_booking_post: function() {
      this.launch_booking_post_ajax({});
    },
    launch_booking_post_ajax: function(body) {
      let buildAjax = this.$.restPostBooking;
      buildAjax.url = this.$['input-post-booking'].value;
      buildAjax.type = "json";
      buildAjax.body = body;
      buildAjax.generateRequest();
    },

    /***************************************************/
    /**       Functions for recieving responses       **/
    /***************************************************/
    _machinePostSuccess: function (event, ironRequest) {
      this._launch_machine_get_ajax();
      this.restSuccess(ironRequest);
    },
    _machineGetSuccess: function (event, ironRequest) {
      this.machines = [];
      try {
        let parsedMachines = []
        for (let machineIndex = 0; machineIndex < ironRequest.response.length; machineIndex += 1) {
          let statusStr = ironRequest.response[machineIndex].status.toLowerCase();
          parsedMachines.push({
            id: ironRequest.response[machineIndex].id,
            location: ironRequest.response[machineIndex].location,
            name: ironRequest.response[machineIndex].name,
            status: statusStr
          });
        }
        this.machines = parsedMachines;
        this.setMachinesDropdownData();
        this.restSuccess(ironRequest);
      }
      catch (e) {
        console.log(e);
        this.displayAlert(
          'Uh Oh!',
          'The machine data couldnt be parsed, See the console for details!',
          'important'
        );
      }
    },
    _machinePutSuccess: function (event, ironRequest) {
      this._launch_machine_get_ajax();
      this.restSuccess(ironRequest);
    },
    _bookingPostSuccess: function (event, ironRequest) {
      this._launch_booking_get_ajax();
      this.restSuccess(ironRequest);
    },
    _bookingGetSuccess: function (event, ironRequest) {
      this.bookings = [];
      try {
        let parsedBookings = []
        for (let bookingIndex = 0; bookingIndex < ironRequest.response.length; bookingIndex += 1) {
          let dateStr = ironRequest.response[bookingIndex].date.substr(0,10);
          if(ironRequest.response[bookingIndex].timeslot > 9) {
            parsedBookings.push({
              machine_id: ironRequest.response[bookingIndex].machine_id,
              job_id: ironRequest.response[bookingIndex].job_id,
              date: dateStr,
              timeslot: `${ironRequest.response[bookingIndex].timeslot}:00`
            });
          }
          else {
            parsedBookings.push({
              machine_id: ironRequest.response[bookingIndex].machine_id,
              job_id: ironRequest.response[bookingIndex].job_id,
              date: dateStr,
              timeslot: `0${ironRequest.response[bookingIndex].timeslot}:00`
            });
          }
        }
        this.bookings = parsedBookings;
        this.restSuccess(ironRequest);
      }
      catch (e) {
        console.log(e);

        this.displayAlert(
          'Uh Oh!',
          'The booking data couldnt be parsed, See the console for details!',
          'important'
        );
      }
    },
    restSuccess: function(ironRequest) {
      this.displayAlert(
        'Woo Hoo!',
        `${ironRequest.status} (${ironRequest.statusText})` +
            ` - Request to ${ironRequest.xhr.responseURL} completed successfuly!`,
        'information'
      );
    },
    _restFail: function(event, ironRequest) {

      if (ironRequest.request.__data__.status !== 500) {
        if (ironRequest.request.__data__.status === 0) {
          this.displayAlert(
            'Uh Oh!',
            `404 - That endpoint doesn't exist`,
            'important'
          );
        } else {
          this.displayAlert(
            'Uh Oh!',
            `${ironRequest.error} - ${ironRequest.request.__data__.statusText}`,
            'important'
          );
        }
      }
      else {
        this.displayAlert(
          'Woo Hoo!',
          'The endpoint exists!',
          'information'
        );
      }
    },

    displayAlert: function(title, message, type) {
      let alertBox = document.createElement("px-alert-message");
      alertBox.messageTitle=title;
      alertBox.message = message;
      alertBox.type=type;
      alertBox.visible = true;
      alertBox.action="dismiss";
      alertBox.hideBadge="true";
      alertBox.autoDismiss = 5000;
      Polymer.dom(this.$.alertMessageContainer).appendChild(alertBox);
    },

    attached: function () {
      this.setMachinesDropdownData();
    },
  }
);
})();
