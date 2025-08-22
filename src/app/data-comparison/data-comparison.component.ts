import { Component, ElementRef, ViewChild } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { CarfaxComponent } from '../carfax/carfax.component';
import { ManheimComponent } from '../manheim/manheim.component';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-data-comparison',
  templateUrl: './data-comparison.component.html',
  styleUrls: ['./data-comparison.component.css'],
  standalone: true,
  imports: [CommonModule, HeaderComponent, CarfaxComponent, ManheimComponent],
})
export class DataComparisonComponent {
  @ViewChild(CarfaxComponent) carfaxComp!: CarfaxComponent;
  @ViewChild(ManheimComponent) manheimComp!: ManheimComponent;
  @ViewChild('excelInput') excelInputRef!: ElementRef<HTMLInputElement>;

  excelFile: File | null = null;
  excelData: any[] = [];

  carfaxResponse: any = null;
  manheimResponse: any = null;

  // Modal and table columns and flags
  showModal = false;
  modalCarfaxStatus = '';
  modalManheimStatus = '';
  modalResult = '';
  junkClassifierStatus: string | null = null;
  vinNotInExcel = false; // Flag to control error message & table visibility

  // Getter for checking if final result matches the junk classifier status (case-insensitive)
  get isJunkClassifierMatch(): boolean {
    if (!this.junkClassifierStatus || !this.modalResult) return false;
    return this.junkClassifierStatus.toLowerCase() === this.modalResult.toLowerCase();
  }

  onReset() {
    this.carfaxComp.reset();
    this.manheimComp.reset();
    this.resetExcel();
    this.carfaxResponse = null;
    this.manheimResponse = null;
  }

  onExcelFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.excelFile = input.files[0];

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0]; // Get first sheet name string
        const firstSheet = workbook.Sheets[firstSheetName]; // Index with string
        this.excelData = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });

        console.log('Excel Data Loaded:', this.excelData);
      };
      reader.readAsArrayBuffer(this.excelFile);
    } else {
      this.excelFile = null;
      this.excelData = [];
    }
  }

  resetExcel() {
    this.excelFile = null;
    this.excelData = [];
    if (this.excelInputRef && this.excelInputRef.nativeElement) {
      this.excelInputRef.nativeElement.value = '';
    }
  }

  updateCarfaxResponse(response: any) {
    this.carfaxResponse = response;
  }

  updateManheimResponse(response: any) {
    this.manheimResponse = response;
  }

  private getVinFromResponse(response: any): string | null {
    if (!response || typeof response !== 'object') return null;
    for (const key of Object.keys(response)) {
      if (key.toLowerCase().trim() === 'vin') {
        return String(response[key]).trim();
      }
    }
    return null;
  }

  private getStatusFromResponse(response: any): string | null {
    if (!response || typeof response !== 'object') return null;
    for (const key of Object.keys(response)) {
      if (key.toLowerCase().trim() === 'status') {
        return String(response[key]).trim();
      }
    }
    return null;
  }

  get showFinalResultButton(): boolean {
    if (!this.excelFile) return false;
    const carfaxResp = this.carfaxResponse;
    const manheimResp = this.manheimResponse;
    if (carfaxResp && manheimResp) {
      const carfaxVin = this.getVinFromResponse(carfaxResp);
      const manheimVin = this.getVinFromResponse(manheimResp);
      return carfaxVin !== null && carfaxVin === manheimVin;
    }
    return !!(carfaxResp || manheimResp);
  }

  getJunkClassifierStatus(vin: string): string | null {
    if (!vin || !this.excelData.length) return null;
    vin = vin.toUpperCase().trim();

    const matchRow = this.excelData.find(row =>
      Object.keys(row).some(
        key => key.toLowerCase().trim() === 'vin' &&
          String(row[key]).toUpperCase().trim() === vin
      )
    );

    if (matchRow) {
      for (const key of Object.keys(matchRow)) {
        if (key.toLowerCase().trim() === 'junk classifier') {
          const value = String(matchRow[key]).trim();
          console.log('Matched VIN:', vin, 'Junk Classifier:', value);
          return value;
        }
      }
      console.warn('Matched VIN, but no "Junk Classifier" column found for VIN:', vin, matchRow);
    } else {
      console.warn('No matching VIN found in Excel for:', vin);
    }
    return null;
  }

  private computeFinalResult(carfaxStatus: string | null, manheimStatus: string | null): string {
    const cStatus = carfaxStatus ?? '';
    const mStatus = manheimStatus ?? '';

    if (!cStatus && !mStatus) return '';

    if (cStatus && !mStatus) return cStatus;
    if (mStatus && !cStatus) return mStatus;

    if (cStatus === mStatus) return cStatus;

    if (cStatus === 'Junk' || mStatus === 'Junk') {
      return 'Junk';
    }

    if (cStatus === 'Not Junk' && mStatus === 'Not Junk') {
      return 'Not Junk';
    }

    if ((cStatus === 'Junk' && !mStatus) || (mStatus === 'Junk' && !cStatus)) {
      return 'Junk';
    }

    return 'Not Junk';
  }

  onFinalResultClick() {
    const carfaxStatus = this.getStatusFromResponse(this.carfaxResponse);
    const manheimStatus = this.getStatusFromResponse(this.manheimResponse);

    const finalResult = this.computeFinalResult(carfaxStatus, manheimStatus);

    const lookupVin =
      this.getVinFromResponse(this.carfaxResponse) ||
      this.getVinFromResponse(this.manheimResponse);

    const classifier = lookupVin ? this.getJunkClassifierStatus(lookupVin) : null;

    this.vinNotInExcel = !lookupVin || !this.excelData.length || classifier === null || classifier === '';

    this.junkClassifierStatus = classifier;

    console.log('VIN lookup:', lookupVin);
    console.log('Modal Carfax Status:', carfaxStatus);
    console.log('Modal Manheim Status:', manheimStatus);
    console.log('Modal Final Result:', finalResult);
    console.log('Junk Classifier Status:', this.junkClassifierStatus);

    this.modalCarfaxStatus = carfaxStatus || '';
    this.modalManheimStatus = manheimStatus || '';
    this.modalResult = finalResult || '';
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }
}
