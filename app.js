class HorasRegistro {
    constructor() {
        this.registros = JSON.parse(localStorage.getItem('registros')) || [];
        this.semanalRegistros = JSON.parse(localStorage.getItem('semanalRegistros')) || {};
        this.initEventListeners();
        this.renderTables();
    }

    initEventListeners() {
        document.getElementById('hoursForm').addEventListener('submit', this.registrarHoras.bind(this));
        document.getElementById('clearTable').addEventListener('click', this.limpiarTabla.bind(this));
        document.getElementById('searchButton').addEventListener('click', this.buscarPorNombre.bind(this));
    }

    calcularDuracionHoras(entrada, salida) {
        const [entradaHora, entradaMinuto] = entrada.split(':').map(Number);
        const [salidaHora, salidaMinuto] = salida.split(':').map(Number);
        
        let horas = salidaHora - entradaHora;
        let minutos = salidaMinuto - entradaMinuto;
        
        if (minutos < 0) {
            horas--;
            minutos += 60;
        }
        
        return { horas, minutos };
    }

    registrarHoras(e) {
        e.preventDefault();
        const nombre = document.getElementById('nombre').value;
        const rango = document.getElementById('rango').value;
        const fecha = document.getElementById('fecha').value;
        const horaEntrada = document.getElementById('horaEntrada').value;
        const horaSalida = document.getElementById('horaSalida').value;

        const duracion = this.calcularDuracionHoras(horaEntrada, horaSalida);
        const totalHoras = duracion.horas + (duracion.minutos / 60);

        const registro = {
            nombre,
            rango,
            fecha,
            horaEntrada,
            horaSalida,
            totalHoras: totalHoras.toFixed(2)
        };

        this.registros.push(registro);
        this.actualizarRegistroSemanal(nombre, totalHoras);
        localStorage.setItem('registros', JSON.stringify(this.registros));
        this.renderTables();
        e.target.reset();
    }

    actualizarRegistroSemanal(nombre, horas) {
        if (!this.semanalRegistros[nombre]) {
            this.semanalRegistros[nombre] = 0;
        }
        this.semanalRegistros[nombre] += horas;
        localStorage.setItem('semanalRegistros', JSON.stringify(this.semanalRegistros));
    }

    renderTables() {
        this.renderHorasTable();
        this.renderSemanalTable();
        this.renderIncumplimientoTable();
        this.renderCumplimientoTable();
    }

    renderHorasTable() {
        const tableBody = document.getElementById('horasTableBody');
        tableBody.innerHTML = '';
        this.registros.forEach(registro => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${registro.nombre}</td>
                <td>${registro.rango}</td>
                <td>${registro.fecha}</td>
                <td>${registro.horaEntrada}</td>
                <td>${registro.horaSalida}</td>
                <td>${registro.totalHoras}</td>
                <td class="${registro.totalHoras >= 3 ? 'green-status' : 'red-status'}">
                    ${registro.totalHoras >= 3 ? '✓' : '✗'}
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    renderSemanalTable() {
        const tableBody = document.getElementById('semanalTableBody');
        tableBody.innerHTML = '';
        Object.entries(this.semanalRegistros).forEach(([nombre, horas]) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${nombre}</td>
                <td>${horas.toFixed(2)}</td>
                <td class="${horas >= 28 ? 'happy-emoji' : 'sad-emoji'}"></td>
            `;
            tableBody.appendChild(row);
        });
    }

    renderIncumplimientoTable() {
        const tableBody = document.getElementById('incumplimientoTableBody');
        tableBody.innerHTML = '';
        Object.entries(this.semanalRegistros)
            .filter(([_, horas]) => horas < 28)
            .forEach(([nombre, horas]) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${nombre}</td>
                    <td>${horas.toFixed(2)}</td>
                `;
                tableBody.appendChild(row);
            });
    }

    renderCumplimientoTable() {
        const tableBody = document.getElementById('cumplimientoTableBody');
        tableBody.innerHTML = '';
        Object.entries(this.semanalRegistros)
            .filter(([_, horas]) => horas >= 28)
            .forEach(([nombre, horas]) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${nombre}</td>
                    <td>${horas.toFixed(2)}</td>
                `;
                tableBody.appendChild(row);
            });
    }

    limpiarTabla() {
        this.registros = [];
        this.semanalRegistros = {};
        localStorage.removeItem('registros');
        localStorage.removeItem('semanalRegistros');
        this.renderTables();
    }

    buscarPorNombre() {
        const searchInput = document.getElementById('searchInput').value.toLowerCase();
        const filteredRegistros = this.registros.filter(registro => 
            registro.nombre.toLowerCase().includes(searchInput)
        );

        const tableBody = document.getElementById('horasTableBody');
        tableBody.innerHTML = '';
        filteredRegistros.forEach(registro => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${registro.nombre}</td>
                <td>${registro.rango}</td>
                <td>${registro.fecha}</td>
                <td>${registro.horaEntrada}</td>
                <td>${registro.horaSalida}</td>
                <td>${registro.totalHoras}</td>
                <td class="${registro.totalHoras >= 3 ? 'green-status' : 'red-status'}">
                    ${registro.totalHoras >= 3 ? '✓' : '✗'}
                </td>
            `;
            tableBody.appendChild(row);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new HorasRegistro();
});