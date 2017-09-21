import './swiper.custom.min';

export default function initSlider() {
  const swiper = new Swiper('.b_slider', {
    pagination: '.pagination',
    paginationClickable: true,
    autoplay: 2000,
    autoHeight: true,
    effect: 'fade',
    loop: true,
    speed: 300,
  });

  const sliderContainer = document.getElementsByClassName('swiper-wrapper')[0];
  if (sliderContainer) {
    sliderContainer.addEventListener('click', () => swiper.slideNext(), true);
  }

  return swiper;
}