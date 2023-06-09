import { settings, select, classNames } from "./settings.js";
import Product from "./components/Product.js";
import Cart from "./components/Cart.js";
import Booking from "./components/Booking.js";
import Home from "./components/Home.js";


const app = {

  initPages: function () {
    const thisApp = this;

    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);


    const idFromHash = window.location.hash.replace('#/', '');

    let pageMatchingHash = thisApp.pages[0].id;

    for (let page of thisApp.pages) {
      if (page.id === idFromHash) {
        pageMatchingHash = page.id;
        break
      }
    }

    thisApp.activatePage(pageMatchingHash);

    for (let link of thisApp.navLinks) {
      link.addEventListener('click', (event) => {
        const clickedElement = event.currentTarget;
        event.preventDefault();

        /* get page id from href attribute */
        const id = clickedElement.getAttribute('href').replace('#', '')
        /* call activatePage method with that id */

        thisApp.activatePage(id);

        /* change URL hash */
        window.location.hash = '#/' + id;

      })
    }
  },

  activatePage: function (pageId) {
    const thisApp = this;

    /* add class "active" to matching pages, remove from non-matching pages */

    for (let page of thisApp.pages) {
      page.classList.toggle(classNames.pages.active, page.id === pageId);
    }

    /* add class "active" to matching links, remove from non-matching links */

    for (let link of thisApp.navLinks) {
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') === '#' + pageId
      );
    }
  },


  initMenu: function () {
    const thisApp = this;

    //console.log('thisApp.data:', thisApp.data)

    for (let productData in thisApp.data.products) {
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },

  initData: function () {
    const thisApp = this;
    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.products;

    fetch(url)
      .then(rawResponse => rawResponse.json())
      .then(parsedResponse => {
        console.log('parsed Response', parsedResponse)

        // save parseResponse as thisApp.data.products
        thisApp.data.products = parsedResponse;

        // execute initMenu method
        thisApp.initMenu();
      })

    console.log('thisApp.data', JSON.stringify(thisApp.data));
  },

  initCart: function () {
    const thisApp = this;
    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);
    thisApp.productList.addEventListener('add-to-cart', (event) => {
      app.cart.add(event.detail.product);
    })

  },

  initBooking: function () {
    const thisApp = this;
    const bookingWidgetContainer = document.querySelector(select.containerOf.booking);

    thisApp.booking = new Booking(bookingWidgetContainer);
  },

  initHomePage: function () {
    const thisApp = this;
    const homePageContainer = document.querySelector(select.containerOf.homePage)

    thisApp.homePage = new Home(homePageContainer);

    thisApp.buttonLinks = document.querySelectorAll(select.nav.buttonLinks)



    for (let link of thisApp.buttonLinks) {
      link.addEventListener('click', (event) => {
        const clickedElement = event.currentTarget;
        event.preventDefault();

        /* get page id from href attribute */
        const id = clickedElement.getAttribute('href').replace('#', '')
        /* call activatePage method with that id */

        thisApp.activatePage(id);

        /* change URL hash */
        window.location.hash = '#/' + id;

      })
    }

  },

  init: function () {
    const thisApp = this;
    //console.log('*** App starting ***');
    //console.log('thisApp:', thisApp);
    //console.log('classNames:', classNames);
    //console.log('settings:', settings);
    //console.log('templates:', templates);

    thisApp.initPages();
    thisApp.initData();
    thisApp.initHomePage();
    thisApp.initCart();
    thisApp.initBooking();

  },
};


app.init();