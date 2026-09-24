import { Component, Input } from '@angular/core';
import {
  ApexNonAxisChartSeries,
  ApexChart,
  ApexPlotOptions,
  ApexFill,
  ApexStroke,
  ApexOptions,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { DropdownItemComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component';

@Component({
  selector: 'app-monthly-target',
  imports: [
    NgApexchartsModule,
    DropdownComponent,
    DropdownItemComponent
  ],
  templateUrl: './monthly-target.component.html',
})
export class MonthlyTargetComponent {
  @Input() title = 'Medicion de reservorio';
  @Input() description = 'Control de nivel de agua en el reservorio';
  @Input() progress = 75.55;
  @Input() change = '+10%';
  @Input() summary = "El nivel de agua en el reservorio se encuentra dentro de los parametros normales.";
  @Input() target = '$20K';
  @Input() revenue = '$20K';
  @Input() today = '$20K';
  @Input() targetLabel = 'm³';
  @Input() revenueLabel = 'litros restante';
  @Input() todayLabel = 'litros ocupados';

  get series(): ApexNonAxisChartSeries {
    return [this.progress];
  }
  public chart: ApexChart = {
    fontFamily: 'Outfit, sans-serif',
    type: 'radialBar',
    height: 330,
    sparkline: { enabled: true },
  };
  public plotOptions: ApexPlotOptions = {
    radialBar: {
      startAngle: -90,
      endAngle: 90,
      hollow: { size: '80%' },
      track: {
        background: '#E4E7EC',
        strokeWidth: '100%',
        margin: 5,
      },
      dataLabels: {
        name: { show: false },
        value: {
          fontSize: '36px',
          fontWeight: '600',
          offsetY: 60,
          color: '#1D2939',
          formatter: (val: number) => `${val}%`,
        },
      },
    },
  };
  public fill: ApexFill = {
    type: 'solid',
    colors: ['#465FFF'],
  };
  public stroke: ApexStroke = {
    lineCap: 'round',
  };
  public labels: string[] = ['Progress'];
  public colors: string[] = ['#465FFF'];

  isOpen = false;

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }
}
