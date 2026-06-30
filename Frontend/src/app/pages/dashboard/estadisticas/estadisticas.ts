import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Chart } from 'chart.js/auto';
import { Navbar } from '../../../components/navbar/navbar';
import {
  EstadisticasService,
  PublicacionPorUsuario,
  ComentarioPorTiempo,
  ComentarioPorPublicacion,
} from '../../../services/estadisticas.service';

/**
 * Página de estadísticas del dashboard de administración.
 * Muestra tres gráficos Chart.js con datos del backend, filtrados por rango de fechas:
 *   - Barras: publicaciones por usuario
 *   - Líneas: comentarios por día
 *   - Doughnut (torta): comentarios por publicación (top 10)
 *
 * Los gráficos se crean en ngAfterViewInit para garantizar que los canvas ya
 * existen en el DOM. Se destruyen en ngOnDestroy para evitar memory leaks.
 */
@Component({
  selector: 'app-estadisticas',
  imports: [FormsModule, Navbar],
  templateUrl: './estadisticas.html',
  styleUrl: './estadisticas.css',
})
export class Estadisticas implements AfterViewInit, OnDestroy {
  @ViewChild('graficoBarras') graficoBarrasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('graficoLineas') graficoLineasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('graficoTorta') graficoTortaRef!: ElementRef<HTMLCanvasElement>;

  private estadisticasService = inject(EstadisticasService);

  private chartBarras: Chart | null = null;
  private chartLineas: Chart | null = null;
  private chartTorta: Chart | null = null;

  // Rango de fechas inicial: últimos 30 días hasta hoy
  desde = signal(this.fechaHaceDias(30));
  hasta = signal(new Date().toISOString().split('T')[0]);
  cargando = signal(false);

  ngAfterViewInit(): void {
    this.inicializarGraficos();
    this.cargarDatos();
  }

  ngOnDestroy(): void {
    // Chart.js mantiene referencias internas al canvas — destroy() las libera
    this.chartBarras?.destroy();
    this.chartLineas?.destroy();
    this.chartTorta?.destroy();
  }

  private fechaHaceDias(dias: number): string {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - dias);
    return fecha.toISOString().split('T')[0];
  }

  private inicializarGraficos(): void {
    this.chartBarras = new Chart(this.graficoBarrasRef.nativeElement, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Publicaciones',
            data: [],
            backgroundColor: 'rgba(13, 110, 253, 0.7)',
            borderColor: 'rgba(13, 110, 253, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'top' }, title: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
      },
    });

    this.chartLineas = new Chart(this.graficoLineasRef.nativeElement, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Comentarios por día',
            data: [],
            borderColor: 'rgba(25, 135, 84, 1)',
            backgroundColor: 'rgba(25, 135, 84, 0.1)',
            fill: true,
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'top' } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
      },
    });

    this.chartTorta = new Chart(this.graficoTortaRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: [],
        datasets: [{ label: 'Comentarios', data: [], backgroundColor: [] }],
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'right' } },
      },
    });
  }

  cargarDatos(): void {
    this.cargando.set(true);
    const d = this.desde();
    const h = this.hasta();

    this.estadisticasService.publicacionesPorUsuario(d, h).subscribe({
      next: (datos: PublicacionPorUsuario[]) => {
        if (this.chartBarras) {
          this.chartBarras.data.labels = datos.map((x) => x.nombreUsuario);
          this.chartBarras.data.datasets[0].data = datos.map((x) => x.cantidad);
          this.chartBarras.update();
        }
      },
      error: (err) => console.error(err),
    });

    this.estadisticasService.comentariosPorTiempo(d, h).subscribe({
      next: (datos: ComentarioPorTiempo[]) => {
        if (this.chartLineas) {
          this.chartLineas.data.labels = datos.map((x) => x.fecha);
          this.chartLineas.data.datasets[0].data = datos.map((x) => x.cantidad);
          this.chartLineas.update();
        }
        this.cargando.set(false);
      },
      error: (err) => {
        console.error(err);
        this.cargando.set(false);
      },
    });

    this.estadisticasService.comentariosPorPublicacion(d, h).subscribe({
      next: (datos: ComentarioPorPublicacion[]) => {
        if (this.chartTorta) {
          const colores = datos.map(
            (_, i) => `hsl(${Math.round((i * 360) / (datos.length || 1))}, 65%, 55%)`,
          );
          this.chartTorta.data.labels = datos.map((x) => x.titulo);
          this.chartTorta.data.datasets[0].data = datos.map((x) => x.cantidad);
          (this.chartTorta.data.datasets[0] as any).backgroundColor = colores;
          this.chartTorta.update();
        }
      },
      error: (err) => console.error(err),
    });
  }

  aplicarFiltro(): void {
    this.cargarDatos();
  }
}
