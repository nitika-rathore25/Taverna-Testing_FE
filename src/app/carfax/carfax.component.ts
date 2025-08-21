import { CommonModule } from '@angular/common';
import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-carfax',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './carfax.component.html',
})
export class CarfaxComponent {
  vin = '';
  pdfFile: File | null = null;

  response: any = null;
  loading = false;
  error: string | null = null;
  validationMessage: string | null = null;

  @ViewChild('pdfInput') pdfInputRef!: ElementRef<HTMLInputElement>;

  objectKeys = Object.keys;

  constructor(private http: HttpClient, private toastr: ToastrService) { }

  onPdfSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.loading = true;
      const file = input.files[0];
      this.pdfFile = file;
      this.vin = ''; // Clear VIN for exclusivity
      this.validationMessage = null;
      this.response = null; // Reset previous response

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'carfax');

      this.http
        .post(`${environment.apiBaseUrl}/upload`, formData)
        .pipe(
          catchError((err) => {
            this.toastr.error('Failed to upload PDF file.', 'Error');
            this.loading = false;
            return of(null);
          })
        )
        .subscribe((data) => {
          if (data) {
            this.response = data;
            this.loading = false;
            this.toastr.info(`PDF file "${file.name}" uploaded successfully. VIN input disabled.`);
          }
        });
    } else {
      this.pdfFile = null;
      this.loading = false;
    }
  }

  submitVIN() {
    this.validationMessage = null;
    this.error = null;
    this.response = null; // Reset previous response

    if (!this.pdfFile && !this.vin.trim()) {
      this.validationMessage = 'Please enter a VIN or upload a PDF file to proceed.';
      this.toastr.warning(this.validationMessage, 'Validation');
      return;
    }

    if (this.pdfFile !== null) {
      this.validationMessage = 'Submission is disabled while PDF file is uploaded. Please remove the PDF to submit.';
      this.toastr.error(this.validationMessage, 'Notice');
      return;
    }

    this.loading = true;

    this.http
      .post(`${environment.apiBaseUrl}/carfax_tester`, { vin: this.vin.trim() })
      .pipe(
        catchError((err) => {
          this.error = err.message ?? 'Network error';
          this.toastr.error(this.error ?? 'Unknown error', 'Error');
          this.loading = false;
          return of(null);
        })
      )
      .subscribe((data) => {
        this.response = data;
        this.loading = false;
      });
  }

  reset() {
    this.vin = '';
    this.pdfFile = null;
    this.response = null;
    this.error = null;
    this.validationMessage = null;

    if (this.pdfInputRef && this.pdfInputRef.nativeElement) {
      this.pdfInputRef.nativeElement.value = '';
    }
  }

  formatValue(value: any): string {
    if (Array.isArray(value)) return value.join(', ');
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }
}
