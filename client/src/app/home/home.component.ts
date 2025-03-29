import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements AfterViewInit {
  @ViewChild('carousel') carousel!: ElementRef;
  currentIndex: number = 0;

  ngAfterViewInit() {
    this.updateSlidePosition();
    setInterval(() => {
      this.nextSlide();
    }, 5000); // 5 giây chuyển slide
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
    const carousel = this.carousel.nativeElement;
    const offset = -this.currentIndex * 100;
    carousel.style.transform = `translateX(${offset}%)`;
  }

  toggleFaq(event: MouseEvent) {
    const element = event.currentTarget as HTMLElement;
    const answer = element.nextElementSibling as HTMLElement;

    const isActive = element.classList.contains('active');

    document.querySelectorAll('.faq-question').forEach((question) => {
      question.classList.remove('active');
      const sibling = question.nextElementSibling as HTMLElement;
      sibling.style.maxHeight = '0';
      sibling.style.padding = '0 20px';
    });

    if (!isActive) {
      element.classList.add('active');
      answer.style.maxHeight = `100px`;
      answer.style.padding = '10px 20px';
    } else {
      element.classList.remove('active');
      answer.style.maxHeight = '0';
      answer.style.padding = '0 20px';
    }
  }
}
