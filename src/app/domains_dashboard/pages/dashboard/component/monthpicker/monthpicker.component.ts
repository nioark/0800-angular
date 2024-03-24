import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';


@Component({
  selector: 'app-monthpicker',
  standalone: true,
  imports: [],
  templateUrl: './monthpicker.component.html',
  styleUrl: './monthpicker.component.scss'
})
export class MonthpickerComponent {
  @Output() monthpickEmitter = new EventEmitter<{ initialDate: Date, finalDate: Date }>();

  @ViewChild('mes_inicio') mesInicioRef: ElementRef | undefined;
  @ViewChild('mes_final') mesFinalRef: ElementRef | undefined;
  @ViewChild('ano_inicio') anoInicioRef: ElementRef | undefined;
  @ViewChild('ano_final') anoFinalRef: ElementRef | undefined;

  months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  getValuesFromViewChild(): string[] {
    const values = [];
    if (this.mesInicioRef) {
      values.push(this.mesInicioRef.nativeElement.value);
    }
    if (this.anoInicioRef) {
      values.push(this.anoInicioRef.nativeElement.value);
    }
    if (this.mesFinalRef) {
      values.push(this.mesFinalRef.nativeElement.value);
    }
    if (this.anoFinalRef) {
      values.push(this.anoFinalRef.nativeElement.value);
    }
    return values;
  }

  private GetLastDayOfMonth(year: number, month: number): number {
    // Create a new date object for the first day of the next month
    // Set the day to 0 to get the last day of the current month
    const lastDayOfMonth = new Date(year, month + 1, 0);
    return lastDayOfMonth.getDate();
  }


  public GetDates(): { initialDate: Date, finalDate: Date } {
    const values = this.getValuesFromViewChild();

    if (values.length !== 4) {
      throw new Error('Expected 4 values (initial month, initial year, final month, final year), but got a different number.');
    }
    const initialMonthNumber = Number(values[0]);
    const initialYearNumber = parseInt(values[1], 10);
    const finalMonthNumber = Number(values[2]);
    const finalYearNumber = parseInt(values[3], 10);

    const initialDate = new Date(initialYearNumber, initialMonthNumber);

    const currentDate = new Date();
    let day = 1
    if (finalMonthNumber == currentDate.getMonth()) {
      day = currentDate.getDate()
    }else {
      day = this.GetLastDayOfMonth(finalYearNumber, finalMonthNumber)
    }

    const finalDate = new Date(finalYearNumber, finalMonthNumber, day, 23, 59, 59);

    return { initialDate, finalDate };
  }

  generateFinalDateOptions(initialDate : Date, finalDate : Date): void {
    if (this.mesFinalRef && this.anoFinalRef) {
      const monthSelectElement: HTMLSelectElement = this.mesFinalRef.nativeElement;
      const yearSelectElement: HTMLSelectElement = this.anoFinalRef.nativeElement;

      const monthSelected = finalDate.getMonth();

      for (let i = 0; i < monthSelectElement.options.length; i++) {
        monthSelectElement.remove(i)
        i--;
      }

      this.months.forEach((month, index) => {
        if (index >= initialDate.getMonth() || finalDate.getFullYear() > initialDate.getFullYear()) {
          let selected = index === monthSelected ? true : false;
          monthSelectElement.add(new Option(month, `${index}`, selected, selected));
        }
      })

      for (let i = 0; i < yearSelectElement.options.length; i++) {
        yearSelectElement.remove(i)
        i--;
      }

      const currentYear = new Date().getFullYear();
      const yearSelected = finalDate.getFullYear();

      for (let year = 2020; year <= currentYear; year++) {
        if (year >= initialDate.getFullYear()) {
          let selected = year === yearSelected ? true : false;
          yearSelectElement.add(new Option(year.toString(), year.toString(), selected, selected));
        }
      }

    }

  }

  generateInitialDateOptions(initialDate : Date): void {
    if (this.mesInicioRef && this.anoInicioRef) {
      const monthSelectElement: HTMLSelectElement = this.mesInicioRef.nativeElement;
      const yearSelectElement: HTMLSelectElement = this.anoInicioRef.nativeElement;

      const currentMonth = initialDate.getMonth();
      const monthSelected = currentMonth;

      this.months.forEach((month, index) => {
        let selected = index === monthSelected ? true : false;
        monthSelectElement.add(new Option(month, `${index}`, selected, selected));
      });

      const currentYear = new Date().getFullYear();
      const yearSelected = initialDate.getFullYear();

      for (let year = 2020; year <= currentYear; year++) {
        let selected = year === yearSelected ? true : false;
        yearSelectElement.add(new Option(year.toString(), year.toString(), selected, selected));
      }
    }
  }

  ngAfterViewInit(){
    // this.generateInitialDateOptions()
    // this.generateFinalDateOptions(new Date(),new Date())
  }

  changeDate() {
    let dates = this.GetDates();
    this.generateFinalDateOptions(dates.initialDate, dates.finalDate)
    this.monthpickEmitter.emit(dates)
  }
}
