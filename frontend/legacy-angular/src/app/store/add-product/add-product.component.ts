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
  isUploading = false;
  submitError: string | null = null;
  submitSuccess: boolean = false;
  selectedFile: File | null = null;
  uploadedImageUrl: string | null = null;

  form = this.fb.group({
    name: ['', [Validators.required]],
    summary: ['', [Validators.required]],
    description: ['', [Validators.required]],
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

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['.png', '.jpg', '.jpeg', '.webp'];
      const fileName = file.name.toLowerCase();
      const isValidType = allowedTypes.some(type => fileName.endsWith(type));

      if (!isValidType) {
        this.submitError = 'Invalid file type. Allowed types: PNG, JPG, JPEG, WebP';
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        this.submitError = 'File size exceeds 5MB limit';
        return;
      }

      this.selectedFile = file;
      this.submitError = null;
    }
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Validate file is selected
    if (!this.selectedFile && !this.uploadedImageUrl) {
      this.submitError = 'Please select an image file';
      return;
    }

    this.isSubmitting = true;
    this.submitError = null;
    this.submitSuccess = false;

    const { name, summary, description, price, brandId, typeId } =
      this.form.value;

    const brand = this.brands.find((b) => b.id === brandId);
    const type = this.types.find((t) => t.id === typeId);

    if (!brand || !type) {
      this.submitError = 'Please select a brand and type';
      this.isSubmitting = false;
      return;
    }

    // If file is already uploaded, use the URL directly
    if (this.uploadedImageUrl) {
      this.createProductWithImageUrl(name!, summary!, description!, price!, brand, type);
      return;
    }

    // Upload file first
    if (this.selectedFile) {
      this.isUploading = true;
      this.storeService.uploadProductImage(this.selectedFile).subscribe({
        next: (response) => {
          this.isUploading = false;
          if (response.success && response.imageUrl) {
            this.uploadedImageUrl = response.imageUrl;
            this.createProductWithImageUrl(name!, summary!, description!, price!, brand, type);
          } else {
            this.isSubmitting = false;
            this.submitError = response.errorMessage || 'Failed to upload image';
          }
        },
        error: (err) => {
          this.isUploading = false;
          this.isSubmitting = false;
          this.submitError = 'Failed to upload image. Please try again.';
          console.error(err);
        },
      });
    }
  }

  private createProductWithImageUrl(
    name: string,
    summary: string,
    description: string,
    price: number,
    brand: IBrand,
    type: IType
  ) {
    const payload = {
      name: name,
      summary: summary,
      description: description,
      imageFile: this.uploadedImageUrl!,
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
