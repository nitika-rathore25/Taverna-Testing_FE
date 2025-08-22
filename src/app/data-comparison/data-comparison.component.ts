import { Component, ElementRef, ViewChild } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { CarfaxComponent } from '../carfax/carfax.component';
import { ManheimComponent } from '../manheim/manheim.component';
import { CommonModule } from '@angular/common';

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

  // Responses will be tracked here
  carfaxResponse: any = null;
  manheimResponse: any = null;

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
    } else {
      this.excelFile = null;
    }
  }

  resetExcel() {
    this.excelFile = null;
    if (this.excelInputRef && this.excelInputRef.nativeElement) {
      this.excelInputRef.nativeElement.value = '';
    }
  }

  // To be called from child components via Output or ViewChild
  updateCarfaxResponse(response: any) {
    this.carfaxResponse = response;
  }

  updateManheimResponse(response: any) {
    this.manheimResponse = response;
  }

  // Extract VIN from response, case-insensitive key search "vin"
  private getVinFromResponse(response: any): string | null {
    if (!response || typeof response !== 'object') return null;
    const keys = Object.keys(response);
    for (const key of keys) {
      if (key.toLowerCase() === 'vin') {
        return String(response[key]);
      }
    }
    return null;
  }

  // Show the Final Result button logic
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

  onFinalResultClick() {
    // Your logic to handle final result click
    console.log('Final Result button clicked');
  }
}
