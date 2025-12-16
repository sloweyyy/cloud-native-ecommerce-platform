import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IBrand } from 'src/app/shared/models/brand';
import { IType } from 'src/app/shared/models/type';
import { StoreService } from '../store.service';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.scss'],
})
export class AddProductComponent implements OnInit {
  private fb = inject(FormBuilder);
  private storeService = inject(StoreService);
  private router = inject(Router);

  brands: IBrand[] = [];
  types: IType[] = [];
  isSubmitting = false;
  submitError: string | null = null;
  submitSuccess: boolean = false;

  form = this.fb.group({
    name: ['', [Validators.required]],
    summary: ['', [Validators.required]],
    description: ['', [Validators.required]],
    imageFile: ['', [Validators.required]],
    price: [0, [Validators.required, Validators.min(0.01)]],
    brandId: ['', [Validators.required]],
    typeId: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.loadOptions();
  }

  loadOptions() {
    this.storeService.getBrands().subscribe((brands) => (this.brands = brands));
    this.storeService.getTypes().subscribe((types) => (this.types = types));
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    this.submitError = null;
    this.submitSuccess = false;

    const { name, summary, description, imageFile, price, brandId, typeId } =
      this.form.value;

    const brand = this.brands.find((b) => b.id === brandId);
    const type = this.types.find((t) => t.id === typeId);

    if (!brand || !type) {
      this.submitError = 'Please select a brand and type';
      this.isSubmitting = false;
      return;
    }

    const payload = {
      name: name!,
      summary: summary!,
      description: description!,
      imageFile: imageFile!,
      price: Number(price),
      brands: { id: brand.id, name: brand.name },
      types: { id: type.id, name: type.name },
    };

    this.storeService.createProduct(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.submitSuccess = true;
        // After success, go back to store
        setTimeout(() => this.router.navigate(['/store']), 800);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.submitError = 'Failed to create product. Please try again.';
        console.error(err);
      },
    });
  }
}
