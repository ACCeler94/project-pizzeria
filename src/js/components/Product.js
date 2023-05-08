import { select, templates, classNames } from "../settings.js";
import utils from "../utils.js";
import AmountWidget from "./AmountWidget.js";


class Product {
    constructor(id, data) {
        const thisProduct = this;
        thisProduct.id = id;
        thisProduct.data = data;
        thisProduct.dom = {};


        thisProduct.renderInMenu();
        thisProduct.getElements();
        thisProduct.initAccordion();
        thisProduct.initOrderForm();
        thisProduct.initAmountWidget();
        thisProduct.processOrder();
    }

    renderInMenu() {
        const thisProduct = this;

        /* Generate HTML based on template */
        const generatedHTML = templates.menuProduct(thisProduct.data);

        /* Create element using utils.createElementFromHtml */
        thisProduct.element = utils.createDOMFromHTML(generatedHTML);
        /* Find menu container */
        const menuContainer = document.querySelector(select.containerOf.menu);
        /* Add elements to menu */
        menuContainer.appendChild(thisProduct.element);
    }

    getElements() {
        const thisProduct = this;

        thisProduct.dom.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
        thisProduct.dom.form = thisProduct.element.querySelector(select.menuProduct.form);
        thisProduct.dom.formInputs = thisProduct.dom.form.querySelectorAll(select.all.formInputs);
        thisProduct.dom.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
        thisProduct.dom.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
        thisProduct.dom.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
        thisProduct.dom.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }

    initAccordion() {
        const thisProduct = this;


        /* START: add event listener to clickable trigger on event click */
        thisProduct.dom.accordionTrigger.addEventListener('click', function (event) {
            /* prevent default action for event */
            event.preventDefault();
            /* find active product (product that has active class) */
            const activeProduct = document.querySelector('.product.active');

            /* if there is active product and it's not thisProduct.element, remove class active from it */
            if (activeProduct && activeProduct !== thisProduct.element) {
                activeProduct.classList.remove('active');

            }
            /* toggle active class on thisProduct.element */
            thisProduct.element.classList.toggle('active');
        });

    }

    initOrderForm() {
        const thisProduct = this;

        thisProduct.dom.form.addEventListener('submit', function (event) {
            event.preventDefault();
            thisProduct.processOrder();
        });

        for (let input of thisProduct.dom.formInputs) {
            input.addEventListener('change', function () {
                thisProduct.processOrder();
            });
        }

        thisProduct.dom.cartButton.addEventListener('click', function (event) {
            event.preventDefault();
            thisProduct.processOrder();
            thisProduct.addToCart();
        });

        //console.log('log from initOrderForm')
    }

    initAmountWidget() {
        const thisProduct = this;

        thisProduct.amountWidget = new AmountWidget(thisProduct.dom.amountWidgetElem)
        thisProduct.dom.amountWidgetElem.addEventListener('updated', () => thisProduct.processOrder())
    }

    processOrder() {
        const thisProduct = this;
        // covert dom.form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
        const formData = utils.serializeFormToObject(thisProduct.dom.form);
        //console.log('formData', formData);

        // set price to default price
        let price = thisProduct.data.price;

        // for every category (param)...
        for (let paramId in thisProduct.data.params) {
            // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
            const param = thisProduct.data.params[paramId];

            // for every option in this category
            for (let optionId in param.options) {
                // console.log('optionId', optionId, typeof (optionId))
                // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
                const option = param.options[optionId];

                // calculate price based on chosen options
                if (option.default && !formData[paramId].includes(optionId)) {
                    price -= option.price;
                } else if (!option.default && formData[paramId].includes(optionId)) {
                    price += option.price;
                }

                //console.log(optionId, option);


                const selectedImage = thisProduct.dom.imageWrapper.querySelector(`.${paramId}-${optionId}`)

                if (selectedImage) {
                    if (formData[paramId] && formData[paramId].includes(optionId)) {
                        selectedImage.classList.add(classNames.menuProduct.imageVisible);
                    } else if (!formData[paramId].includes(optionId)) {
                        selectedImage.classList.remove(classNames.menuProduct.imageVisible);
                    }
                }
            }
        }

        // get the price for a single item
        thisProduct.priceSingle = price;
        //multiply price based on quantity
        price *= thisProduct.amountWidget.value;

        // update calculated price in the HTML
        thisProduct.dom.priceElem.innerHTML = price;
    }

    addToCart() {
        const thisProduct = this;

        // app.cart.add(thisProduct.prepareCartProduct());

        const event = new CustomEvent('add-to-cart', {
            bubbles: true,
            detail: {
                product: thisProduct.prepareCartProduct(),
            },
        });

        thisProduct.element.dispatchEvent(event);
    }

    prepareCartProduct() {
        const thisProduct = this;

        const productSummary = {};

        productSummary.id = thisProduct.id;
        productSummary.name = thisProduct.data.name;
        productSummary.amount = thisProduct.amountWidget.value;
        productSummary.priceSingle = thisProduct.priceSingle;
        productSummary.price = thisProduct.priceSingle * thisProduct.amountWidget.value;
        productSummary.params = thisProduct.prepareCartProductParams();

        //console.log('product summary', productSummary)
        return productSummary;
    }

    prepareCartProductParams() {
        const thisProduct = this;

        const productParams = {};

        const formData = utils.serializeFormToObject(thisProduct.dom.form);

        // for every category (param)...
        for (let paramId in thisProduct.data.params) {
            // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
            const param = thisProduct.data.params[paramId];

            productParams[paramId] = {
                label: param.label,
                options: {}
            }

            // for every option in this category
            for (let optionId in param.options) {
                // console.log('optionId', optionId, typeof (optionId))
                // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
                const option = param.options[optionId];

                // calculate price based on chosen options
                if (formData[paramId] && formData[paramId].includes(optionId)) {
                    productParams[paramId].options[optionId] = option.label
                }
            }
        }


        return productParams
    }
}


export default Product;