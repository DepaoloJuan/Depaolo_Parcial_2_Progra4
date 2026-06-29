import {
  Component,
  inject,
  signal,
  OnInit,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { Navbar } from '../../../components/navbar/navbar';
import { EstadisticasService } from '../../../services/estadisticas.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [Navbar, FormsModule],
  templateUrl: './estadisticas.html',
  styleUrl: './estadisticas.css',
})
export class Estadisticas implements OnInit {
  private estadisticasService = inject(EstadisticasService);

  // Fechas por defecto: último mes
  desde = signal(this.primerDiaMes());
  hasta = signal(this.hoy());

  cargando = signal(false);

  // Referencias a los canvas de los gráficos
  @ViewChild('graficoPublicaciones') graficoPublicacionesRef!: ElementRef;
  @ViewChild('graficoComentariosTiempo') graficoComentariosTiempoRef!: ElementRef;
  @ViewChild('graficoComentariosPublicacion') graficoComentariosPublicacionRef!: ElementRef;

  // Instancias de Chart para poder destruirlas al recargar
  private charts: Chart[] = [];

  ngOnInit(): void {
    this.cargarEstadisticas();
  }

  private primerDiaMes(): string {
    const hoy = new Date();
    return new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
  }

  private hoy(): string {
    return new Date().toISOString().split('T')[0];
  }

  cargarEstadisticas(): void {
    this.cargando.set(true);
    this.charts.forEach(c => c.destroy());
    this.charts = [];

    const desdeStr = this.desde();
    const hastaStr = `${this.hasta()}T23:59:59`;

    Promise.all([
      lastValueFrom(this.estadisticasService.publicacionesPorUsuario(desdeStr, hastaStr)),
      lastValueFrom(this.estadisticasService.comentariosPorTiempo(desdeStr, hastaStr)),
      lastValueFrom(this.estadisticasService.comentariosPorPublicacion(desdeStr, hastaStr)),
    ]).then(([pubUsuario, comTiempo, comPublicacion]) => {
      this.cargando.set(false);
      setTimeout(() => {
        this.crearGraficoBarras(pubUsuario ?? []);
        this.crearGraficoLineas(comTiempo ?? []);
        this.crearGraficoTorta(comPublicacion ?? []);
      }, 100);
    }).catch(() => this.cargando.set(false));
  }

  private crearGraficoBarras(datos: any[]): void {
    const canvas = this.graficoPublicacionesRef?.nativeElement;
    if (!canvas) return;

    const chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: datos.map((d) => d.nombreUsuario ?? d._id),
        datasets: [
          {
            label: 'Publicaciones',
            data: datos.map((d) => d.cantidad),
            backgroundColor: '#1877F2',
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
      },
    });
    this.charts.push(chart);
  }

  private crearGraficoLineas(datos: any[]): void {
    const canvas = this.graficoComentariosTiempoRef?.nativeElement;
    if (!canvas) return;

    const labels = datos.map((d) => `${d._id.dia}/${d._id.mes}/${d._id.año}`);

    const chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Comentarios',
            data: datos.map((d) => d.cantidad),
            borderColor: '#1877F2',
            backgroundColor: 'rgba(24,119,242,0.1)',
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
      },
    });
    this.charts.push(chart);
  }

  private crearGraficoTorta(datos: any[]): void {
    const canvas = this.graficoComentariosPublicacionRef?.nativeElement;
    if (!canvas) return;

    const chart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: datos.map((d) => d.titulo ?? d._id),
        datasets: [
          {
            data: datos.map((d) => d.cantidad),
            backgroundColor: ['#1877F2', '#42B72A', '#FA383E', '#F7B928', '#9B59B6', '#1ABC9C'],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom' } },
      },
    });
    this.charts.push(chart);
  }
}
