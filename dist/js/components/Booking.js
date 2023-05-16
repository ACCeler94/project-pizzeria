import { classNames, select, settings, templates } from "../settings.js";
import utils from "../utils.js";
import AmountWidget from "./AmountWidget.js";
import DatePicker from "./DatePicker.js";
import HourPicker from "./HourPicker.js";

class Booking {
  constructor(wrapper) {
    const thisBooking = this;

    thisBooking.render(wrapper);
    thisBooking.getElements();
    thisBooking.initWidgets();
    thisBooking.getData();
  }

  getData() {
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate)

    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate)


    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    //console.log('getData params', params)

    const urls = {
      booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent.join('&'),
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat.join('&'),
    }

    //console.log('getData urls', urls)
    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(allResponses => {
        const bookingResponse = allResponses[0]
        const eventsCurrentResponse = allResponses[1]
        const eventsRepeatResponse = allResponses[2]

        return Promise.all([
          bookingResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(([bookings, eventsCurrent, eventsRepeat]) => {
        //console.log(bookings)
        //console.log(eventsCurrent)
        //console.log(eventsRepeat)
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat)
      })
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {}

    for (let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table)
    }

    for (let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table)
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for (let item of eventsRepeat) {
      if (item.repeat == 'daily') {
        for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {

          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table)
        }
      }
    }
    console.log('thisBooking.booked', thisBooking.booked)
    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    if (typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }

    // convert hour format (ex. 16:30) to number (ex. 16.5)
    const startHour = utils.hourToNumber(hour);


    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {
      //console.log('loop', hourBlock)

      if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }
      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  clearSelected() {
    // remove class selected from all tables and revert thisBooking.selectedTable back to an empty array
    const thisBooking = this;
    thisBooking.dom.tablesContainer.querySelectorAll('.' + classNames.booking.table).forEach(table => {
      table.classList.remove(classNames.booking.tableSelected)
    });
    thisBooking.selectedTable = null;
  }

  initTables(event) {
    const thisBooking = this;

    if (event.target.classList.contains(classNames.booking.tableSelected)) {
      thisBooking.clearSelected()

    } else if (event.target.classList.contains(classNames.booking.table) && !event.target.classList.contains(classNames.booking.tableBooked)) {
      thisBooking.clearSelected()

      event.target.classList.add(classNames.booking.tableSelected);

      const tableId = event.target.getAttribute(settings.booking.tableIdAttribute);

      thisBooking.selectedTable = parseInt(tableId);

      console.log('selected table id', thisBooking.selectedTable)

      // clear selection when floor is clicked
    } else if (event.target.classList.contains(classNames.booking.floorPlan)) {
      thisBooking.clearSelected();

    } else if (event.target.classList.contains(classNames.booking.tableBooked)) {
      const alert = document.getElementById('alert');
      alert.style.display = 'block';
      setTimeout(() => {
        alert.style.display = 'none';
      }, 3000);
    }
  }


  updateDOM() {
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if (
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ) {
      allAvailable = true;
    }

    for (let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }

      if (
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked)
      }
    }
    thisBooking.clearSelected();
    console.log(thisBooking)
  }

  getElements() {
    const thisBooking = this;

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.tablesContainer = thisBooking.dom.wrapper.querySelector(select.containerOf.tables);
    thisBooking.dom.phoneInput = thisBooking.dom.wrapper.querySelector(select.booking.phoneInput);
    thisBooking.dom.addressInput = thisBooking.dom.wrapper.querySelector(select.booking.addressInput);
    thisBooking.dom.checkboxes = thisBooking.dom.wrapper.querySelectorAll(select.booking.starterCheckboxes);
    thisBooking.dom.form = thisBooking.dom.wrapper.querySelector(select.booking.form);
  }

  render(wrapper) {
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();

    thisBooking.dom = {};

    thisBooking.dom.wrapper = wrapper;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
  }

  initWidgets() {
    const thisBooking = this;
    thisBooking.tablesWidget = thisBooking.dom.tablesContainer;

    thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount)
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.selectedTable = null;

    thisBooking.tablesWidget.addEventListener('click', (event) => {
      console.log(event.target)
      thisBooking.initTables(event);
    })

    thisBooking.dom.wrapper.addEventListener('updated', () => {
      thisBooking.updateDOM();
    })

    thisBooking.dom.form.addEventListener('submit', (event) => {
      event.preventDefault();
      console.log('form submitted');
      thisBooking.sendBooking();
    })


  }



  sendBooking() {
    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.booking;
    const payload = {
      date: thisBooking.date,
      hour: thisBooking.hourPicker.value,
      table: thisBooking.selectedTable,
      duration: thisBooking.hoursAmountWidget.correctValue,
      ppl: thisBooking.peopleAmountWidget.correctValue,
      starters: [],
      phone: thisBooking.dom.phoneInput.value,
      address: thisBooking.dom.addressInput.value

    }

    const checkboxes = thisBooking.dom.checkboxes
    checkboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        payload.starters.push(checkbox.value);
      } else {
        payload.starters = payload.starters.filter((value) => value !== checkbox.value);
      }
    });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };


    // why is this sending multiple times?
    fetch(url, options)
      .then(response => response.json())
      .then(parsedResponse => {
        thisBooking.makeBooked(parsedResponse.date, parsedResponse.hour, parsedResponse.duration, parsedResponse.table)
        thisBooking.updateDOM();
        console.log('newBooked', thisBooking.booked)
        console.log(parsedResponse)
      })
  }
}

export default Booking;