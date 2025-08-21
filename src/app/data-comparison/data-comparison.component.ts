import { Component, ElementRef, ViewChild } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { CarfaxComponent } from '../carfax/carfax.component';
import { ManheimComponent } from '../manheim/manheim.component';

@Component({
  selector: 'app-data-comparison',
  templateUrl: './data-comparison.component.html',
  styleUrls: ['./data-comparison.component.css'],
  standalone: true,
  imports: [HeaderComponent, CarfaxComponent, ManheimComponent],
})
export class DataComparisonComponent {
  @ViewChild(CarfaxComponent) carfaxComp!: CarfaxComponent;
  @ViewChild(ManheimComponent) manheimComp!: ManheimComponent;
  @ViewChild('excelInput') pdfInputRef!: ElementRef<HTMLInputElement>;

  excelFile: File | null = null;

  onReset() {
    this.carfaxComp.reset();
    this.manheimComp.reset();
    this.resetExcel();
  }

  onExcelFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.excelFile = input.files[0];
      // You can process or pass this file to service/component as needed here
      console.log('Selected Excel file:', this.excelFile.name);
    }
  }

  resetExcel() {
    this.excelFile = null;
    if (this.pdfInputRef && this.pdfInputRef.nativeElement) {
      this.pdfInputRef.nativeElement.value = '';
    }
  }
}
