import { select } from "../settings.js";
import AmountWidget from "./AmountWidget.js"

class CartProduct {
  constructor(menuProduct, element) {
    const thisCartProduct = this;

    thisCartProduct.id = menuProduct.id;
    thisCartProduct.name = menuProduct.name;
    thisCartProduct.amount = menuProduct.amount;
    thisCartProduct.priceSingle = menuProduct.priceSingle;
    thisCartProduct.price = menuProduct.price;
    thisCartProduct.params = menuProduct.params;

    thisCartProduct.getElements(element);
    thisCartProduct.initAmountWidget();
    thisCartProduct.initActions();

    //console.log('thisCartProduct', thisCartProduct)
  }

  getElements(element) {
    const thisCartProduct = this;
    thisCartProduct.dom = {};
    thisCartProduct.dom.wrapper = element;
    thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
    thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
    thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
    thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
  }

  initAmountWidget() {
    const thisCartProduct = this;

    thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget)

    console.log(thisCartProduct.amountWidget) // value shown is always 1 ??

    console.log('amountWidget.value', thisCartProduct.amountWidget.value)

    // those line added to fix incorrect widget values
    thisCartProduct.amountWidget.value = thisCartProduct.amount
    thisCartProduct.amountWidget.dom.input.value = thisCartProduct.amount;


    console.log('amountWidget.value after change', thisCartProduct.amountWidget.value)

    thisCartProduct.dom.amountWidget.addEventListener('updated', () => {
      thisCartProduct.amount = thisCartProduct.amountWidget.value;
      thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;
      thisCartProduct.dom.price.innerHTML = thisCartProduct.price;

      console.log('this dom.amountWidget', thisCartProduct.dom.amountWidget);


    })
  }

  remove() {
    const thisCartProduct = this;

    const event = new CustomEvent('remove', {
      bubbles: true,
      detail: {
        cartProduct: thisCartProduct
      },
    });

    thisCartProduct.dom.wrapper.dispatchEvent(event);
    console.log('remove dispatched')
  }

  initActions() {
    const thisCartProduct = this;

    thisCartProduct.dom.edit.addEventListener('click', (event) => {
      event.preventDefault();
    });

    thisCartProduct.dom.remove.addEventListener('click', (event) => {
      event.preventDefault();

      thisCartProduct.remove()
    });

  }

  getData() {
    const thisCartProduct = this;

    const cartProductData = {
      id: thisCartProduct.id,
      amount: thisCartProduct.amount,
      price: thisCartProduct.price,
      priceSingle: thisCartProduct.priceSingle,
      name: thisCartProduct.name,
      params: thisCartProduct.params,
    }

    return cartProductData;
  }
}

export default CartProduct;