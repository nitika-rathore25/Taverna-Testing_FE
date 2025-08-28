import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../environments/environment';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-data-comparison',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, HeaderComponent],
  templateUrl: './data-comparison.component.html',
  styleUrls: ['./data-comparison.component.css'],
})
export class DataComparisonComponent {
  @ViewChild('excelInput') excelInputRef!: ElementRef;
  @ViewChild('carfaxPdfInput') carfaxPdfInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('manheimPdfInput') manheimPdfInputRef!: ElementRef<HTMLInputElement>;


  activeTab: 'upload' | 'vin' = 'upload';

  excelFile: File | null = null;
  excelData: any[] = [];

  carfaxPdfFile_upload: File | null = null;
  manheimPdfFile_upload: File | null = null;
  carfaxResponse_upload: any = null;
  manheimResponse_upload: any = null;
  manualVin_upload: string = '';
  loadingCarfax_upload = false;
  loadingManheim_upload = false;

  carfaxVin_vin: string = '';
  manheimVin_vin: string = '';
  carfaxResponse_vin: any = null;
  manheimResponse_vin: any = null;
  loadingCarfax_vin = false;
  loadingManheim_vin = false;

  showModal = false;

  modalCarfax: string = '';
  modalManheim: string = '';
  modalResult: string = '';
  junkClassifier: string | null = null;
  junkClassifierStatus: string | null = null;

  vinMismatch = false;
  vinUnavailable = false;
  vinNotInExcel = false;

  constructor(private http: HttpClient, private toastr: ToastrService) { }

  switchTab(tab: 'upload' | 'vin'): void {
    this.activeTab = tab;
  }

  onExcelSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.excelFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        this.excelData = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
      };
      reader.readAsArrayBuffer(this.excelFile);
    } else {
      this.excelFile = null;
      this.excelData = [];
      if (this.excelInputRef?.nativeElement) {
        this.excelInputRef.nativeElement.value = '';
      }
    }
  }

  onCarfaxPdfSelected(event: Event): void {
    if (this.activeTab !== 'upload') return;
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.carfaxPdfFile_upload = input.files[0];
      this.carfaxResponse_upload = null;
      this.loadingCarfax_upload = true;

      const formData = new FormData();
      formData.append('file', this.carfaxPdfFile_upload);
      formData.append('type', 'carfax');

      this.http.post(`${environment.apiBaseUrl}/upload/carfax`, formData)
        .pipe(
          catchError((err) => {
            this.toastr.error('Failed to upload Carfax PDF.', 'Error');
            this.loadingCarfax_upload = false;
            return of(null);
          })
        )
        .subscribe((data) => {
          this.carfaxResponse_upload = data;
          this.loadingCarfax_upload = false;
        });
    }
  }

  onManheimPdfSelected(event: Event): void {
    if (this.activeTab !== 'upload') return;
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.manheimPdfFile_upload = input.files[0];
      this.manheimResponse_upload = null;
      this.loadingManheim_upload = true;

      const formData = new FormData();
      formData.append('file', this.manheimPdfFile_upload);
      formData.append('type', 'manheim');

      this.http.post(`${environment.apiBaseUrl}/upload/manheim`, formData)
        .pipe(
          catchError((err) => {
            this.toastr.error('Failed to upload Manheim PDF.', 'Error');
            this.loadingManheim_upload = false;
            return of(null);
          })
        )
        .subscribe((data) => {
          this.manheimResponse_upload = data;
          this.loadingManheim_upload = false;
        });
    }
  }

  submitVin(source: 'carfax' | 'manheim'): void {
    if (this.activeTab !== 'vin') return;

    let vin = '';
    if (source === 'carfax') {
      vin = this.carfaxVin_vin.trim();
      if (!vin) {
        this.toastr.warning('Enter VIN before submitting Carfax.', 'Validation');
        return;
      }
      this.loadingCarfax_vin = true;
    } else {
      vin = this.manheimVin_vin.trim();
      if (!vin) {
        this.toastr.warning('Enter VIN before submitting Manheim.', 'Validation');
        return;
      }
      this.loadingManheim_vin = true;
    }

    this.http.post(`${environment.apiBaseUrl}/${source}_tester`, { vin })
      .pipe(
        catchError((err) => {
          this.toastr.error(err.message || 'Network error', 'Error');
          if (source === 'carfax') this.loadingCarfax_vin = false;
          else this.loadingManheim_vin = false;
          return of(null);
        })
      )
      .subscribe((data) => {
        if (source === 'carfax') {
          this.carfaxResponse_vin = data;
          this.loadingCarfax_vin = false;
        } else {
          this.manheimResponse_vin = data;
          this.loadingManheim_vin = false;
        }
      });
  }

  onCommonReset(): void {
    if (this.activeTab === 'upload') {
      this.carfaxPdfFile_upload = null;
      this.manheimPdfFile_upload = null;
      this.carfaxResponse_upload = null;
      this.manheimResponse_upload = null;
      this.manualVin_upload = '';
      this.loadingCarfax_upload = false;
      this.loadingManheim_upload = false;

      if (this.carfaxPdfInputRef) {
        this.carfaxPdfInputRef.nativeElement.value = '';
      }
      if (this.manheimPdfInputRef) {
        this.manheimPdfInputRef.nativeElement.value = '';
      }
    } else if (this.activeTab === 'vin') {
      this.carfaxVin_vin = '';
      this.manheimVin_vin = '';
      this.carfaxResponse_vin = null;
      this.manheimResponse_vin = null;
      this.loadingCarfax_vin = false;
      this.loadingManheim_vin = false;
    }
    this.resetModalInfo();
  }

  resetModalInfo(): void {
    this.showModal = false;
    this.modalCarfax = '';
    this.modalManheim = '';
    this.modalResult = '';
    this.junkClassifierStatus = null;
    this.junkClassifier = null;
    this.vinMismatch = false;
    this.vinUnavailable = false;
    this.vinNotInExcel = false;
  }

  objectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  formatValue(value: any): string {
    if (Array.isArray(value)) return value.join(', ');
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  }

  getVinFromResponse(response: any): string | null {
    if (!response) return null;
    for (const key of Object.keys(response)) {
      if (key.toLowerCase() === 'vin') return String(response[key]).trim();
    }
    return null;
  }

  getStatusFromResponse(response: any): string | null {
    if (!response) return null;
    for (const key of Object.keys(response)) {
      if (key.toLowerCase() === 'status') return String(response[key]).trim();
    }
    return null;
  }

  getJunkClassifierStatus(vin: string): string | null {
    if (!vin || !this.excelData.length) return null;
    vin = vin.toUpperCase();
    const match = this.excelData.find(row =>
      Object.keys(row).some(k => k.toLowerCase() === 'vin' && String(row[k]).toUpperCase() === vin)
    );
    if (match) {
      for (const key of Object.keys(match)) {
        if (key.toLowerCase() === 'junk classifier') {
          return String(match[key]).trim();
        }
      }
    }
    return null;
  }

  computeResult(cStatus: string | null, mStatus: string | null): string {
    const cs = cStatus ?? '';
    const ms = mStatus ?? '';
    if (!cs && !ms) return '';
    if (cs && !ms) return cs;
    if (ms && !cs) return ms;
    if (cs === ms) return cs;
    if (cs === 'Junk' || ms === 'Junk') return 'Junk';
    if (cs === 'Not Junk' && ms === 'Not Junk') return 'Not Junk';
    return 'Not Junk';
  }

  isJunkStatusMatched(): boolean {
    return !!this.junkClassifierStatus &&
      !!this.modalResult &&
      this.junkClassifierStatus.toLowerCase() === this.modalResult.toLowerCase();
  }

  shouldShowVinBox(): boolean {
    if (this.activeTab !== 'upload') return false;
    return !!this.carfaxPdfFile_upload &&
      !!this.manheimPdfFile_upload &&
      !this.getVinFromResponse(this.carfaxResponse_upload) &&
      !this.getVinFromResponse(this.manheimResponse_upload);
  }

  canShowButton(): boolean {
    if (!this.excelFile || !this.excelData.length) return false;
    if (this.activeTab === 'upload') {
      return !!this.carfaxPdfFile_upload &&
        !!this.manheimPdfFile_upload &&
        (!!this.carfaxResponse_upload || !!this.manheimResponse_upload || this.manualVin_upload.trim() !== '');
    } else {
      return this.carfaxVin_vin.trim() !== '' || this.manheimVin_vin.trim() !== '';
    }
  }

  onShow(): void {
    let cResp, mResp, cVin, mVin, cStatus, mStatus, manualVin;
    if (this.activeTab === 'upload') {
      cResp = this.carfaxResponse_upload;
      mResp = this.manheimResponse_upload;
      cVin = this.getVinFromResponse(cResp);
      mVin = this.getVinFromResponse(mResp);
      cStatus = this.getStatusFromResponse(cResp);
      mStatus = this.getStatusFromResponse(mResp);
      manualVin = this.manualVin_upload;
    } else {
      cResp = this.carfaxResponse_vin;
      mResp = this.manheimResponse_vin;
      cVin = this.carfaxVin_vin;
      mVin = this.manheimVin_vin;
      cStatus = this.getStatusFromResponse(cResp);
      mStatus = this.getStatusFromResponse(mResp);
      manualVin = '';
    }

    if (this.activeTab === 'upload') {
      if (!this.carfaxPdfFile_upload) {
        this.toastr.error('Please upload Carfax PDF.');
        return;
      }
      if (!this.manheimPdfFile_upload) {
        this.toastr.error('Please upload Manheim PDF.');
        return;
      }
      if (!cVin && !mVin && !manualVin.trim()) {
        this.toastr.error('Please enter VIN since missing in PDFs.');
        return;
      }
    } else {
      if (!cVin && !mVin) {
        this.toastr.error('Please enter at least one VIN.');
        return;
      }
    }

    this.vinMismatch = !!(cVin && mVin && cVin !== mVin);
    let lookupVin = cVin || mVin || (manualVin ? manualVin.trim().toUpperCase() : null);

    this.vinUnavailable = !lookupVin && !this.vinMismatch;
    this.junkClassifierStatus = lookupVin ? this.getJunkClassifierStatus(lookupVin) : null;
    this.junkClassifier = this.junkClassifierStatus;
    this.vinNotInExcel = !this.vinUnavailable && !this.vinMismatch && !this.junkClassifierStatus;

    this.modalCarfax = cStatus || '';
    this.modalManheim = mStatus || '';
    this.modalResult = this.computeResult(cStatus, mStatus);
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  isStatusMatched(): boolean {
    return this.junkClassifier !== null &&
      this.modalResult !== '' &&
      this.junkClassifier.toLowerCase() === this.modalResult.toLowerCase();
  }

  isAnyApiLoading(): boolean {
    return this.loadingCarfax_upload || this.loadingManheim_upload || this.loadingCarfax_vin || this.loadingManheim_vin;
  }


}
