import { select, templates } from "../settings.js";

class Home {
  constructor(wrapper) {
    const thisHome = this;

    thisHome.render(wrapper);
    thisHome.getElements();
    thisHome.initWidgets();

  }

  getElements() {
    const thisHome = this;

    thisHome.dom.carousel = document.querySelector(select.widgets.carousel.wrapper);
  }

  initWidgets() {
    const thisHome = this;

    // eslint-disable-next-line no-undef
    thisHome.carouselWidget = new Flickity(thisHome.dom.carousel, {
      cellAlign: 'left',
      contain: true,
      autoPlay: true,
      pauseAutoPlayOnHover: false
    })
  }

  render(wrapper) {
    const thisHome = this;
    const generatedHTML = templates.homePage();

    thisHome.dom = {};

    thisHome.dom.wrapper = wrapper;
    thisHome.dom.wrapper.innerHTML = generatedHTML;

  }

}

export default Home;