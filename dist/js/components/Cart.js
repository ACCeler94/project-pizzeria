import { select, classNames, settings, templates } from "../settings.js";
import utils from "../utils.js";
import CartProduct from "./CartProduct.js";

class Cart {
  constructor(element) {
    const thisCart = this;

    thisCart.products = [];
    thisCart.getElements(element);
    thisCart.initActions();

    //console.log('new Cart', thisCart);

  }

  getElements(element) {
    const thisCart = this;

    thisCart.dom = {};

    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.address = thisCart.dom.form.querySelector(select.cart.address);
    thisCart.dom.phone = thisCart.dom.form.querySelector(select.cart.phone);
  }

  initActions() {
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function () {
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    })

    thisCart.dom.productList.addEventListener('updated', function () {
      thisCart.update();
    });

    thisCart.dom.productList.addEventListener('remove', (event) => thisCart.remove(event.detail.cartProduct));

    thisCart.dom.form.addEventListener('submit', event => {
      event.preventDefault();

      thisCart.sendOrder();
    })
  }

  sendOrder() {
    const thisCart = this;

    const url = settings.db.url + '/' + settings.db.orders;
    const payload = {
      address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.subtotalPrice,
      totalNumber: thisCart.totalNumber,
      products: []
    }

    for (let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };





    fetch(url, options)
      .then(response => response.json())
      .then(parsedResponse => console.log('parsedResponse', parsedResponse))
  }

  add(menuProduct) {
    const thisCart = this;
    //console.log('menu product', menuProduct)

    /* Generate HTML based on template */
    console.log('menu product.amount', menuProduct.amount)
    const generatedHTML = templates.cartProduct(menuProduct);

    /* Create element using utils.createElementFromHtml */
    const generatedDom = utils.createDOMFromHTML(generatedHTML);
    /* Add elements to cart */
    thisCart.dom.productList.appendChild(generatedDom);

    thisCart.products.push(new CartProduct(menuProduct, generatedDom));
    //console.log('thisCart.products', thisCart.products)

    thisCart.update();
  }

  update() {
    const thisCart = this;
    const deliveryFee = settings.cart.defaultDeliveryFee;

    let totalNumber = 0;
    let subtotalPrice = 0;

    for (let product of thisCart.products) {
      totalNumber += product.amount;
      subtotalPrice += product.price;
    }

    if (totalNumber) {
      thisCart.totalPrice = subtotalPrice + deliveryFee;
      thisCart.dom.deliveryFee.innerHTML = deliveryFee;
    } else {
      thisCart.totalPrice = 0;
      thisCart.dom.deliveryFee.innerHTML = 0;
    }

    thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
    thisCart.dom.totalNumber.innerHTML = totalNumber;

    thisCart.dom.totalPrice.forEach(element => {
      element.innerHTML = thisCart.totalPrice;

    }
    );

    thisCart.subtotalPrice = subtotalPrice
    thisCart.totalNumber = totalNumber;
    console.log('totalNumber', totalNumber);
    console.log('subtotal', subtotalPrice);
    console.log('totalPrice', thisCart.totalPrice);
  }

  remove(cartProduct) {
    const thisCart = this;

    cartProduct.dom.wrapper.remove();

    // console.log('products before deletion', thisCart.products)

    thisCart.products = thisCart.products.filter(element => element !== cartProduct)

    //  console.log('products after deletion', thisCart.products)

    thisCart.update();
  }
}

export default Cart;