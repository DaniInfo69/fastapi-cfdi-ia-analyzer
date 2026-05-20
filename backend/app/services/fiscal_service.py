import csv
import os
from typing import List, Dict, Any

class FiscalService:
    def __init__(self, csv_name: str = "Regimen_Fiscal_CDFI_4.csv"):
        self.csv_name = csv_name

    def _resolve_csv_path(self) -> str:
        """Busca el archivo CSV en el directorio raíz o relativo al backend."""
        # Intenta buscar en la ruta de ejecución actual
        if os.path.exists(self.csv_name):
            return self.csv_name
        
        # Intenta buscar subiendo niveles desde la ubicación de este archivo del servicio
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        potential_path = os.path.join(base_dir, self.csv_name)
        if os.path.exists(potential_path):
            return potential_path
            
        return ""

    def get_all_regimes(self) -> List[Dict[str, Any]]:
        """Lee el CSV dinámicamente y estructura los datos para el frontend."""
        regimes = []
        csv_path = self._resolve_csv_path()

        # Fallback de seguridad en caso de que el archivo no esté accesible temporalmente
        if not csv_path:
            return [
                {"id": "601", "es": "601 - General de Ley Personas Morales", "en": "601 - General Regime for Legal Entities", "moral": True},
                {"id": "603", "es": "603 - Personas Morales con Fines no Lucrativos", "en": "603 - Non-Profit Legal Entities", "moral": True},
                {"id": "605", "es": "605 - Sueldos y Salarios e Ingresos Asimilados a Salarios", "en": "605 - Wages, Salaries, and Similar Income", "moral": False},
                {"id": "626", "es": "626 - Régimen Simplificado de Confianza (RESICO)", "en": "626 - Simplified Trust Regime (RESICO)", "moral": True}
            ]

        with open(csv_path, mode='r', encoding='utf-8') as file:
            # Usamos el lector básico de csv para mantener el backend ligero sin dependencias extra
            reader = csv.reader(file)
            next(reader)  # Omitimos la fila de encabezados
            
            for row in reader:
                if len(row) >= 5:
                    regime_id = row[0].strip()
                    desc_es = row[1].strip()
                    desc_en = row[2].strip()
                    is_moral = row[4].strip().lower() in ['sí', 'si', 'yes', 'true']
                    
                    regimes.append({
                        "id": regime_id,
                        "es": f"{regime_id} - {desc_es}",
                        "en": f"{regime_id} - {desc_en}",
                        "moral": is_moral
                    })
                    
        return regimes