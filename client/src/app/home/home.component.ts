import { Component, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  @ViewChild('carousel') carousel!: ElementRef;
  currentIndex: number = 0;
  private intervalId: any;
  private bannerIntervalId: any;
  currentBannerIndex: number = 0;

  ngAfterViewInit() {
    // Make sure the carousel is visible before starting
    setTimeout(() => {
      this.updateSlidePosition();
      this.startCarousel();
      this.startBannerCarousel();
    }, 100);
  }

  ngOnDestroy() {
    // Clear intervals when component is destroyed
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    if (this.bannerIntervalId) {
      clearInterval(this.bannerIntervalId);
    }
  }

  startCarousel() {
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, 5000); // Change slide every 5 seconds
  }

  startBannerCarousel() {
    this.bannerIntervalId = setInterval(() => {
      this.nextBannerSlide();
    }, 4000); // Change banner slide every 4 seconds
  }

  nextSlide() {
    const slides = this.carousel.nativeElement.children;
    if (this.currentIndex < slides.length - 1) {
      this.currentIndex++;
    } else {
      this.currentIndex = 0; // Loop back to the first slide
    }
    this.updateSlidePosition();
  }

  prevSlide() {
    const slides = this.carousel.nativeElement.children;
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else {
      this.currentIndex = slides.length - 1; // Loop back to the last slide
    }
    this.updateSlidePosition();
  }

  updateSlidePosition() {
    if (!this.carousel || !this.carousel.nativeElement) return;

    const carousel = this.carousel.nativeElement;
    const offset = -this.currentIndex * 100;
    carousel.style.transform = `translateX(${offset}%)`;
  }

  // Black Friday Banner functions
  setBannerSlide(index: number) {
    this.currentBannerIndex = index;
    this.updateBannerSlide();

    // Reset the interval timer when manually changing slide
    if (this.bannerIntervalId) {
      clearInterval(this.bannerIntervalId);
      this.startBannerCarousel();
    }
  }

  nextBannerSlide() {
    this.currentBannerIndex = (this.currentBannerIndex + 1) % 4;
    this.updateBannerSlide();
  }

  updateBannerSlide() {
    const slides = document.querySelectorAll('.banner-slide');
    const indicators = document.querySelectorAll('.indicator');

    // Hide all slides and remove active class from indicators
    slides.forEach((slide, index) => {
      slide.classList.remove('active');
      indicators[index].classList.remove('active');
    });

    // Show current slide and set active indicator
    slides[this.currentBannerIndex].classList.add('active');
    indicators[this.currentBannerIndex].classList.add('active');
  }

  toggleFaq(event: MouseEvent) {
    const element = event.currentTarget as HTMLElement;
    const answer = element.nextElementSibling as HTMLElement;

    const isActive = element.classList.contains('active');

    document.querySelectorAll('.faq-question').forEach((question) => {
      question.classList.remove('active');
      const sibling = question.nextElementSibling as HTMLElement;
      sibling.classList.remove('show');
    });

    if (!isActive) {
      element.classList.add('active');
      answer.classList.add('show');
    }
  }
}
